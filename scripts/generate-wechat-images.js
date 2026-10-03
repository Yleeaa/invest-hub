/**
 * 生成微信公众号图片：从云端接口拉取最新数据，渲染完整表格并截图输出 PNG。
 * 每个标的（纳指100 / 标普500）单独生成一张图片。
 *
 * 用法：node scripts/generate-wechat-images.js
 * 输出目录：wechat-images/
 *
 * 依赖：仅使用 Node 内置模块 + 本机 Edge 浏览器（headless 截图），无需 npm install。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');
const vm = require('vm');
const { execFileSync } = require('child_process');

const API_URL = 'https://ceshi-1-d1g0czdaa999081f4-1470950321.ap-shanghai.app.tcloudbase.com/get-nasdaq-funds';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'wechat-images');
const IMG_WIDTH = 1600;

/* ---------- 数据获取 ---------- */

function fetchJson(url, redirects = 3) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.get(
      { hostname: u.hostname, path: u.pathname + u.search, headers: { Accept: 'application/json' } },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          const next = new URL(res.headers.location, url).toString();
          if (redirects <= 0) return reject(new Error('too many redirects'));
          return resolve(fetchJson(next, redirects - 1));
        }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('timeout')));
  });
}

function loadLocal() {
  const p = path.join(ROOT, 'js', 'nasdaq-funds.js');
  const code = fs.readFileSync(p, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { filename: p });
  return {
    data: sandbox.window.NASDAQ_FUNDS || [],
    updated: sandbox.window.NASDAQ_FUNDS_UPDATED || ''
  };
}

async function loadData() {
  try {
    const json = await fetchJson(API_URL);
    if (json && json.code === 0 && Array.isArray(json.data) && json.data.length) {
      return { data: json.data, updated: json.updated || '', source: '云端数据（每日自动更新）' };
    }
    throw new Error('云接口返回为空');
  } catch (e) {
    const local = loadLocal();
    return {
      data: local.data,
      updated: local.updated,
      source: '本地快照（云端拉取失败：' + e.message + '）'
    };
  }
}

/* ---------- 渲染逻辑（与 fund-tracking.html 保持一致） ---------- */

function num(v) {
  if (v == null || v === '' || v === '---') return null;
  const m = String(v).match(/-?[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function feeText(v) { return v ? String(v).replace('（每年）', '') : '—'; }

function badge(f) {
  if (f.cat === 'ETF') return { cls: 'ok', text: '场内交易' };
  const s = f.purchaseStatus;
  if (s === '限大额') return { cls: 'warn', text: '限大额' };
  if (s === '暂停申购') return { cls: 'stop', text: '暂停申购' };
  if (s === '开放申购') return { cls: 'ok', text: '开放申购' };
  if (s === '封闭期') return { cls: 'closed', text: '封闭期' };
  return { cls: 'plain', text: s || '—' };
}
function catTag(cat) {
  if (cat === 'ETF') return '<span class="tag etf">场内</span>';
  return '<span class="tag idx">场外</span>';
}
function limitCell(f) {
  if (f.cat === 'ETF') return '<span class="muted">—</span>';
  if (f.purchaseStatus === '暂停申购') return '<span class="muted">—</span>';
  const v = f.dailyLimit;
  if (!v || v === '---') return '<span class="muted">—</span>';
  return num(v) === 0 ? '<span class="limit-zero">' + v + '</span>' : v;
}
function trackCell(f) {
  return f.trackingError ? f.trackingError : '<span class="muted">—</span>';
}
function premiumCell(f) {
  if (f.cat !== 'ETF') return '<span class="muted">—</span>';
  const p = f.premium;
  if (p == null || p === '') return '<span class="muted">—</span>';
  const cls = p > 0 ? 'limit-zero' : 'ok';
  return '<span class="' + cls + '">' + (p > 0 ? '+' : '') + p + '%</span>';
}
function isSuspended(f) { return f.cat !== 'ETF' && f.purchaseStatus === '暂停申购'; }
function limitRank(f) {
  if (isSuspended(f)) return { suspended: true, limit: 0 };
  if (f.cat === 'ETF') return { suspended: false, limit: Infinity };
  const n = num(f.dailyLimit);
  return { suspended: false, limit: n == null ? Infinity : n };
}
function defaultSort(list) {
  return list.slice().sort((a, b) => {
    const ra = limitRank(a), rb = limitRank(b);
    if (ra.suspended !== rb.suspended) return ra.suspended ? 1 : -1;
    return rb.limit - ra.limit;
  });
}
function fundIndex(f) { return f.index || 'NDX'; }

function rowsFor(data, target) {
  const list = data.filter((f) => {
    if (f.ccy !== '人民币') return false;
    return fundIndex(f) === target;
  });
  return defaultSort(list);
}

function rowHtml(f) {
  const b = badge(f);
  return '<tr>' +
    '<td class="code">' + f.code + '</td>' +
    '<td class="name">' + esc(f.name) + '</td>' +
    '<td>' + catTag(f.cat) + '</td>' +
    '<td class="muted">' + (f.establishDate || '—') + '</td>' +
    '<td class="num">' + (f.nav || '<span class="muted">—</span>') + '<div class="navdate">' + (f.navDate || '') + '</div></td>' +
    '<td class="num">' + (f.scale || '—') + '</td>' +
    '<td><span class="badge ' + b.cls + '">' + b.text + '</span></td>' +
    '<td>' + limitCell(f) + '</td>' +
    '<td class="num">' + (f.purchaseMin || '—') + '</td>' +
    '<td class="num">' + (feeText(f.mgmtFee) || '—') + '</td>' +
    '<td class="num">' + (feeText(f.custodyFee) || '—') + '</td>' +
    '<td class="num">' + trackCell(f) + '</td>' +
    '<td class="num">' + premiumCell(f) + '</td>' +
    '</tr>';
}

function statsHtml(rows) {
  const onEx = rows.filter((f) => f.cat === 'ETF').length;
  const offEx = rows.length - onEx;
  const limited = rows.filter((f) => f.cat !== 'ETF' && f.purchaseStatus === '限大额').length;
  const stopped = rows.filter((f) => f.cat !== 'ETF' && f.purchaseStatus === '暂停申购').length;
  const closed = rows.filter((f) => f.cat !== 'ETF' && f.purchaseStatus === '封闭期').length;
  const stat = (k, v, cls) =>
    '<div class="stat"><span class="k">' + k + '</span><span class="v ' + (cls || '') + '">' + v + '</span></div>';
  return stat('基金总数', rows.length, 'gold') +
    stat('场内', onEx) +
    stat('场外', offEx) +
    stat('限大额', limited) +
    stat('暂停申购', stopped, 'red') +
    stat('封闭期', closed);
}

/* ---------- HTML 模板 ---------- */

const THEAD = '<tr>' +
  '<th>代码</th><th>基金简称</th><th>类别</th><th>成立日</th><th>单位净值</th><th>规模</th>' +
  '<th>限购状态</th><th>单日限额</th><th>申购起点</th><th>管理费</th><th>托管费</th><th>跟踪误差</th><th>溢价率</th>' +
  '</tr>';

function buildHtml(target, rows, updatedText, sourceText) {
  const title = target === 'NDX' ? '纳指100 指数基金全景' : '标普500 指数基金全景';
  const sub = '场内 ETF / 场外 QDII 指数与联接 —— 基本信息与限购情况';
  const bodyRows = rows.map(rowHtml).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
:root{--gold:#c9a961;--gold-bright:#d4b56a;--gold-soft:rgba(201,169,97,.15);--bg:#000000;--bg-soft:#0a0a0a;--surface:rgba(255,255,255,.03);--border:rgba(255,255,255,.08);--text:#f0f0f0;--text-soft:#888;--text-dim:#555;--ok:#3ddc84;--warn:#e8b64c;--stop:#ff6b6b;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{background:#000;}
body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;color:#f0f0f0;width:${IMG_WIDTH}px;padding:56px 48px 64px;}
.sheet{max-width:${IMG_WIDTH}px;margin:0 auto;}
.brand{font-size:15px;color:#888;letter-spacing:3px;margin-bottom:6px;}
.brand b{color:#d4b56a;font-weight:600;}
h1{font-family:"PingFang SC","Microsoft YaHei",serif;font-size:44px;font-weight:900;letter-spacing:3px;background:linear-gradient(135deg,#f7e7a0 0%,#d4b56a 55%,#8a6e30 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;line-height:1.2;}
.sub{margin-top:12px;color:#888;font-size:17px;letter-spacing:1px;}
.updated{margin-top:10px;color:#555;font-size:15px;}
.updated b{color:#d4b56a;font-weight:600;}
.stats{display:flex;flex-wrap:wrap;gap:12px;margin:28px 0 20px;}
.stat{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:12px 20px;display:flex;flex-direction:column;gap:4px;min-width:110px;}
.stat .k{font-size:13px;color:#555;letter-spacing:1px;}
.stat .v{font-size:24px;font-weight:700;}
.stat .v.gold{color:#d4b56a;}
.stat .v.red{color:#ff6b6b;}
.table-wrap{overflow:hidden;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:#0a0a0a;}
table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:14px;}
thead th{background:#101010;color:#888;font-weight:600;letter-spacing:1px;padding:16px 10px;text-align:left;white-space:nowrap;border-bottom:1px solid rgba(255,255,255,.08);overflow:hidden;text-overflow:ellipsis;}
tbody td{padding:14px 10px;border-bottom:1px solid rgba(255,255,255,.04);white-space:normal;vertical-align:middle;overflow:hidden;}
tbody tr:last-child td{border-bottom:none;}
td.code{font-family:Consolas,Menlo,monospace;color:#888;letter-spacing:1px;white-space:nowrap;}
td.name{line-height:1.5;font-size:15px;color:#f0f0f0;}
td.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;}
.navdate{color:#555;font-size:12px;margin-top:2px;}
.tag{display:inline-block;padding:3px 10px;border-radius:5px;font-size:13px;letter-spacing:1px;}
.tag.etf{background:rgba(167,139,250,.15);color:#c4b5fd;}
.tag.idx{background:rgba(61,220,132,.12);color:#3ddc84;}
.badge{display:inline-block;padding:4px 11px;border-radius:6px;font-size:13px;font-weight:600;letter-spacing:1px;}
.badge.ok{background:rgba(61,220,132,.14);color:#3ddc84;}
.badge.warn{background:rgba(232,182,76,.16);color:#e8b64c;}
.badge.stop{background:rgba(255,107,107,.15);color:#ff6b6b;}
.badge.closed{background:rgba(136,136,136,.16);color:#aaa;}
.badge.plain{background:rgba(255,255,255,.06);color:#888;}
.muted{color:#555;}
.limit-zero{color:#ff6b6b;}
.note{margin-top:24px;color:#555;font-size:14px;line-height:1.8;}
</style>
</head>
<body>
<div class="sheet">
  <div class="brand"><b>投么有度</b> · 基金跟踪 · 每日更新</div>
  <h1>${title}</h1>
  <p class="sub">${sub}</p>
  <p class="updated">数据更新：<b>${updatedText}</b> · ${sourceText} · 数据来源：天天基金</p>
  <div class="stats">${statsHtml(rows)}</div>
  <div class="table-wrap">
    <table>
      <colgroup>
        <col style="width:8%"><col style="width:16%"><col style="width:7%"><col style="width:8%"><col style="width:7%"><col style="width:7%"><col style="width:8%"><col style="width:7%"><col style="width:7%"><col style="width:6%"><col style="width:6%"><col style="width:6%"><col style="width:7%">
      </colgroup>
      <thead>${THEAD}</thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </div>
  <p class="note">说明：① 场内 ETF 通过证券账户在二级市场自由买卖，其“限购状态”标为场内交易。② “限大额”表示单日申购有金额上限（受 QDII 外汇额度影响，美股指数基金普遍限购）。③ 默认按「暂停申购置底、单日限额降序」排列，场内 ETF 视为不限额排最前。④ 跟踪误差为年化跟踪误差（来源：天天基金特色数据）；溢价率=(最新价-IOPV)/IOPV，仅场内 ETF 展示（来源：东方财富行情）。数据每日自动更新，请以基金公司公告及天天基金为准。</p>
</div>
<script>
window.addEventListener('load', function(){
  document.documentElement.setAttribute('data-height', document.documentElement.scrollHeight);
});
</script>
</body>
</html>`;
}

/* ---------- 截图 ---------- */

function formatUpdated(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai', hour12: false,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

function fileUrl(p) { return 'file:///' + p.replace(/\\/g, '/'); }

function edgeArgs(width, height, extra) {
  const base = [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--mute-audio',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=' + width + ',' + height,
    '--virtual-time-budget=2500'
  ];
  return base.concat(extra);
}

function measureHeight(htmlPath) {
  try {
    const out = execFileSync(EDGE, edgeArgs(IMG_WIDTH, 1000, ['--dump-dom', fileUrl(htmlPath)]), {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']
    });
    const m = out.match(/data-height="(\d+)"/);
    return m ? parseInt(m[1], 10) : null;
  } catch (e) {
    return null;
  }
}

function screenshot(htmlPath, pngPath) {
  const measured = measureHeight(htmlPath);
  const height = measured ? measured + 4 : 8000;
  execFileSync(EDGE, edgeArgs(IMG_WIDTH, height, ['--screenshot=' + pngPath, fileUrl(htmlPath)]), {
    stdio: 'ignore'
  });
}

function dateStamp() {
  const s = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }); // YYYY-MM-DD HH:mm:ss
  return s.slice(0, 10).replace(/-/g, '');
}

/* ---------- 主流程 ---------- */

async function main() {
  if (!fs.existsSync(EDGE)) {
    console.error('未找到 Edge 浏览器：' + EDGE);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('正在拉取最新数据...');
  const { data, updated, source } = await loadData();
  const updatedText = formatUpdated(updated);
  console.log('数据源：' + source + '，更新时间：' + updatedText + '，总条数：' + data.length);

  const stamp = dateStamp();
  const targets = [
    { idx: 'NDX', label: '纳指100' },
    { idx: 'SPX', label: '标普500' }
  ];

  for (const t of targets) {
    const rows = rowsFor(data, t.idx);
    if (!rows.length) {
      console.warn('  [跳过] ' + t.label + ' 无数据');
      continue;
    }
    const html = buildHtml(t.idx, rows, updatedText, source);
    const htmlPath = path.join(__dirname, '.tmp-wechat-' + t.idx + '.html');
    fs.writeFileSync(htmlPath, html, 'utf8');

    const pngName = t.label + '_' + stamp + '.png';
    const pngPath = path.join(OUT_DIR, pngName);
    console.log('  生成 ' + t.label + ' 图片（' + rows.length + ' 条）...');
    screenshot(htmlPath, pngPath);
    fs.unlinkSync(htmlPath);
    console.log('  已输出 ' + pngPath);
  }

  console.log('完成。输出目录：' + OUT_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});