/**
 * 美股被动指数基金（纳指100 / 标普500）—— 基本信息 + 限购情况抓取
 *
 * 数据源：天天基金 F10 费率/购买信息页  http://fundf10.eastmoney.com/jjfl_{code}.html
 * 覆盖：纳指100 / 标普500 的场外 QDII 指数基金 / 场外 ETF 联接 / 场内 ETF（仅保留人民币份额）
 *
 * 可在三种环境下运行：
 *   1. CloudBase 云函数（导出 main，可配合定时触发器每日执行）
 *   2. 本地脚本（scripts/run-fetch-local.js 调用 scrapeAll 生成静态数据）
 *   3. 任意 Node 定时任务 / CI
 */
'use strict';

const http = require('http');
const https = require('https');
const { URL } = require('url');

/* ============================================================
 * 纳斯达克100 被动指数基金完整清单（截至 2026-09）
 * 结构：[代码, 名称, 基金公司, 类别, 币种, 份额类别]
 *   类别：ETF=场内 | 联接=场外ETF联接 | 指数=场外指数基金
 * 说明：已剔除“纳斯达克科技/生物科技/精选(主动)”等非纳斯达克100标的产品，
 *       并仅保留人民币份额（剔除美元现汇/现钞份额）。
 * ============================================================ */
const NDX_LIST = [
  // —— 场内 ETF（证券账户二级市场可直接买卖）——
  ['513100', '国泰纳斯达克100ETF(QDII)', '国泰', 'ETF', '人民币', '-'],
  ['513110', '华泰柏瑞纳斯达克100ETF(QDII)', '华泰柏瑞', 'ETF', '人民币', '-'],
  ['513300', '华夏纳斯达克100ETF(QDII)', '华夏', 'ETF', '人民币', '-'],
  ['513390', '博时纳斯达克100ETF(QDII)', '博时', 'ETF', '人民币', '-'],
  ['513870', '富国纳斯达克100ETF(QDII)', '富国', 'ETF', '人民币', '-'],
  ['159501', '嘉实纳斯达克100ETF(QDII)', '嘉实', 'ETF', '人民币', '-'],
  ['159513', '大成纳斯达克100ETF(QDII)', '大成', 'ETF', '人民币', '-'],
  ['159632', '华安纳斯达克100ETF(QDII)', '华安', 'ETF', '人民币', '-'],
  ['159659', '招商纳斯达克100ETF(QDII)', '招商', 'ETF', '人民币', '-'],
  ['159660', '汇添富纳斯达克100ETF(QDII)', '汇添富', 'ETF', '人民币', '-'],
  ['159696', '易方达纳斯达克100ETF(QDII)', '易方达', 'ETF', '人民币', '-'],
  ['159941', '广发纳斯达克100ETF(QDII)', '广发', 'ETF', '人民币', '-'],
  ['159509', '景顺长城纳斯达克科技ETF(QDII)', '景顺长城', 'ETF', '人民币', '-'],

  // —— 场外 QDII 指数基金 ——
  ['160213', '国泰纳斯达克100指数(QDII)', '国泰', '指数', '人民币', '-'],
  ['016452', '南方纳斯达克100指数发起(QDII)A', '南方', '指数', '人民币', 'A'],
  ['016453', '南方纳斯达克100指数发起(QDII)C', '南方', '指数', '人民币', 'C'],
  ['021000', '南方纳斯达克100指数发起(QDII)I', '南方', '指数', '人民币', 'I'],
  ['018043', '天弘纳斯达克100指数发起(QDII)A', '天弘', '指数', '人民币', 'A'],
  ['018044', '天弘纳斯达克100指数发起(QDII)C', '天弘', '指数', '人民币', 'C'],
  ['022525', '天弘纳斯达克100指数发起(QDII)D', '天弘', '指数', '人民币', 'D'],
  ['019172', '摩根纳斯达克100指数(QDII)人民币A', '摩根', '指数', '人民币', 'A'],
  ['019173', '摩根纳斯达克100指数(QDII)人民币C', '摩根', '指数', '人民币', 'C'],
  ['019441', '万家纳斯达克100指数发起式(QDII)A', '万家', '指数', '人民币', 'A'],
  ['019442', '万家纳斯达克100指数发起式(QDII)C', '万家', '指数', '人民币', 'C'],
  ['019736', '宝盈纳斯达克100指数发起(QDII)A人民币', '宝盈', '指数', '人民币', 'A'],
  ['019737', '宝盈纳斯达克100指数发起(QDII)C人民币', '宝盈', '指数', '人民币', 'C'],
  ['539001', '建信纳斯达克100指数(QDII)A人民币', '建信', '指数', '人民币', 'A'],
  ['012752', '建信纳斯达克100指数(QDII)C人民币', '建信', '指数', '人民币', 'C'],
  ['023422', '建信纳斯达克100指数(QDII)D人民币', '建信', '指数', '人民币', 'D'],

  // —— 场外 ETF 联接 ——
  ['270042', '广发纳斯达克100ETF联接人民币(QDII)A', '广发', '联接', '人民币', 'A'],
  ['006479', '广发纳斯达克100ETF联接人民币(QDII)C', '广发', '联接', '人民币', 'C'],
  ['021778', '广发纳指100ETF联接(QDII)人民币F', '广发', '联接', '人民币', 'F'],
  ['000834', '大成纳斯达克100ETF联接(QDII)A', '大成', '联接', '人民币', 'A'],
  ['008971', '大成纳斯达克100ETF联接(QDII)C', '大成', '联接', '人民币', 'C'],
  ['040046', '华安纳斯达克100ETF联接(QDII)A', '华安', '联接', '人民币', 'A'],
  ['014978', '华安纳斯达克100ETF联接(QDII)C', '华安', '联接', '人民币', 'C'],
  ['015299', '华夏纳斯达克100ETF发起式联接(QDII)A', '华夏', '联接', '人民币', 'A'],
  ['015300', '华夏纳斯达克100ETF发起式联接(QDII)C', '华夏', '联接', '人民币', 'C'],
  ['016055', '博时纳斯达克100ETF发起式联接(QDII)A人民币', '博时', '联接', '人民币', 'A'],
  ['016057', '博时纳斯达克100ETF发起式联接(QDII)C人民币', '博时', '联接', '人民币', 'C'],
  ['024237', '博时纳斯达克100ETF发起式联接(QDII)I人民币', '博时', '联接', '人民币', 'I'],
  ['016532', '嘉实纳斯达克100ETF发起联接(QDII)A人民币', '嘉实', '联接', '人民币', 'A'],
  ['016533', '嘉实纳斯达克100ETF发起联接(QDII)C人民币', '嘉实', '联接', '人民币', 'C'],
  ['021838', '嘉实纳斯达克100ETF发起联接(QDII)I人民币', '嘉实', '联接', '人民币', 'I'],
  ['018966', '汇添富纳斯达克100ETF发起式联接(QDII)人民币A', '汇添富', '联接', '人民币', 'A'],
  ['018967', '汇添富纳斯达克100ETF发起式联接(QDII)人民币C', '汇添富', '联接', '人民币', 'C'],
  ['021773', '汇添富纳斯达克100ETF发起式联接(QDII)人民币E', '汇添富', '联接', '人民币', 'E'],
  ['019524', '华泰柏瑞纳斯达克100ETF发起式联接(QDII)A', '华泰柏瑞', '联接', '人民币', 'A'],
  ['019525', '华泰柏瑞纳斯达克100ETF发起式联接(QDII)C', '华泰柏瑞', '联接', '人民币', 'C'],
  ['022664', '华泰柏瑞纳斯达克100ETF发起式联接(QDII)I', '华泰柏瑞', '联接', '人民币', 'I'],
  ['019547', '招商纳斯达克100ETF发起式联接(QDII)A', '招商', '联接', '人民币', 'A'],
  ['019548', '招商纳斯达克100ETF发起式联接(QDII)C', '招商', '联接', '人民币', 'C'],
  ['161130', '易方达纳斯达克100ETF联接(QDII-LOF)A(人民币)', '易方达', '联接', '人民币', 'A'],
  ['012870', '易方达纳斯达克100ETF联接(QDII-LOF)C(人民币)', '易方达', '联接', '人民币', 'C'],
  ['017091', '景顺长城纳斯达克科技ETF联接(QDII)A人民币', '景顺长城', '联接', '人民币', 'A'],
  ['017093', '景顺长城纳斯达克科技ETF联接(QDII)C人民币', '景顺长城', '联接', '人民币', 'C'],
  ['019118', '景顺长城纳斯达克科技ETF联接(QDII)E人民币', '景顺长城', '联接', '人民币', 'E']
];

/* ============================================================
 * 标普500 被动指数基金完整清单（截至 2026-09，仅人民币份额）
 * 说明：已剔除“等权重”及 FOF 类产品（非直接跟踪标普500指数），
 *       并仅保留人民币份额（剔除美元现汇/现钞份额）。
 * ============================================================ */
const SPX_LIST = [
  // —— 场内 ETF（证券账户二级市场可直接买卖）——
  ['513500', '博时标普500ETF(QDII)', '博时', 'ETF', '人民币', '-'],
  ['513650', '南方标普500ETF(QDII)', '南方', 'ETF', '人民币', '-'],
  ['159655', '华夏标普500ETF(QDII)', '华夏', 'ETF', '人民币', '-'],
  ['159612', '国泰标普500ETF(QDII)', '国泰', 'ETF', '人民币', '-'],

  // —— 场外 ETF 联接 ——
  ['050025', '博时标普500ETF联接A(人民币)', '博时', '联接', '人民币', 'A'],
  ['006075', '博时标普500ETF联接C(人民币)', '博时', '联接', '人民币', 'C'],
  ['018738', '博时标普500ETF联接E(人民币)', '博时', '联接', '人民币', 'E'],
  ['018064', '华夏标普500ETF发起式联接(QDII)A', '华夏', '联接', '人民币', 'A'],
  ['018065', '华夏标普500ETF发起式联接(QDII)C', '华夏', '联接', '人民币', 'C'],
  ['017028', '国泰标普500ETF发起联接(QDII)A', '国泰', '联接', '人民币', 'A'],
  ['017030', '国泰标普500ETF发起联接(QDII)C', '国泰', '联接', '人民币', 'C'],

  // —— 场外 QDII 指数基金 ——
  ['161125', '易方达标普500指数(QDII-LOF)A(人民币)', '易方达', '指数', '人民币', 'A'],
  ['012860', '易方达标普500指数(QDII-LOF)C(人民币)', '易方达', '指数', '人民币', 'C'],
  ['017641', '摩根标普500指数(QDII)人民币A', '摩根', '指数', '人民币', 'A'],
  ['017642', '摩根标普500指数(QDII)人民币C', '摩根', '指数', '人民币', 'C']
];

/* 合并纳指100与标普500清单，并标记标的指数（NDX=纳斯达克100 / SPX=标普500） */
const FUND_LIST = NDX_LIST.map((it) => it.concat('NDX')).concat(SPX_LIST.map((it) => it.concat('SPX')));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* 页面编码不统一（部分 utf-8、部分 gb18030），按内容自动识别 */
function decodePage(buf) {
  const utf8 = buf.toString('utf8');
  if (utf8.indexOf('\uFFFD') >= 0 || utf8.indexOf('基金') < 0) {
    try {
      const gbk = new TextDecoder('gb18030').decode(buf);
      if (gbk.indexOf('基金') >= 0) return gbk;
    } catch (e) { /* ignore */ }
  }
  return utf8;
}

/* 抓取页面（自动跟随重定向，按内容自动识别编码） */
function fetchText(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 3) { reject(new Error('too many redirects')); return; }
    const u = new URL(url);
    const mod = u.protocol === 'https:' ? https : http;
    const req = mod.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Referer': 'http://fund.eastmoney.com/' + (u.pathname.match(/\d{6}/) || [''])[0] + '.html'
      },
      timeout: 20000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        const next = new URL(res.headers.location, url).toString();
        fetchText(next, redirects + 1).then(resolve, reject);
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        resolve(decodePage(buf));
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.end();
  });
}

const pick = (html, re, g) => {
  const m = html.match(re);
  return m ? (m[g || 1] || '').trim() : '';
};

/* 抓取 JSON 行情接口（东方财富 push2delay，返回 UTF-8 JSON） */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://quote.eastmoney.com/'
      },
      timeout: 20000
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.end();
  });
}

/* 场内 ETF 市场标识：5/6 开头为沪市(1)，其余为深市(0) */
const etfMarket = (code) => (code[0] === '5' || code[0] === '6') ? '1' : '0';

/* 批量抓取 ETF 溢价率（东财行情：f402 折价率，f441 IOPV，f297 数据日期） */
async function fetchEtfPremium(etfCodes) {
  const map = {};
  if (!etfCodes.length) return map;
  try {
    const secids = etfCodes.map((c) => etfMarket(c) + '.' + c).join(',');
    const url = 'https://push2delay.eastmoney.com/api/qt/ulist.np/get?fltt=2&invt=2&secids=' + secids + '&fields=f2,f12,f297,f402,f441';
    const j = await fetchJSON(url);
    const diff = (j && j.data && j.data.diff) || [];
    const arr = Array.isArray(diff) ? diff : Object.values(diff);
    for (const row of arr) {
      const code = String(row.f12);
      const discount = typeof row.f402 === 'number' ? row.f402 : null;
      map[code] = {
        iopv: typeof row.f441 === 'number' ? row.f441 : '',
        premium: discount == null ? '' : Math.round(-discount * 100) / 100,
        priceDate: row.f297 ? String(row.f297) : ''
      };
    }
  } catch (e) { /* 溢价率抓取失败不阻塞主流程 */ }
  return map;
}

/* 抓取年化跟踪误差（天天基金 F10 特色数据页） */
async function fetchTrackingError(code) {
  const url = 'https://fundf10.eastmoney.com/tsdata_' + code + '.html';
  try {
    const html = await fetchText(url);
    const m = html.match(/年化跟踪误差<\/th>\s*<th>同类平均跟踪误差<\/th>[\s\S]*?<td[^>]*>[^<]*<\/td>\s*<td[^>]*>([^<]+)<\/td>/);
    return m ? m[1].trim() : '';
  } catch (e) {
    return '';
  }
}

/* 从 jjfl 页解析基本信息 + 限购情况 */
function parseDetail(html, code) {
  const navM = html.match(/单位净值（([^）]*)）：[\s\S]*?<b[^>]*>\s*([\d.]+)/);
  const scaleM = html.match(/净资产规模：<span>\s*([^<\s（]+)\s*（截止至：([\d-]+)）<\/span>/);
  return {
    code,
    nav: navM ? navM[2] : '',
    navDate: navM ? navM[1] : '',
    purchaseStatus: pick(html, /申购状态<\/td><td class="w135">([^<]*)<\/td>/),
    redeemStatus: pick(html, /赎回状态<\/td><td class="w135">([^<]*)<\/td>/),
    autoInvest: pick(html, /定投状态<\/td><td class="w135">([^<]*)<\/td>/),
    dailyLimit: pick(html, /日累计申购限额<\/td><td class="w135">([^<]*)<\/td>/),
    maxHolding: pick(html, /持仓上限<\/td><td class="w135">([^<]*)<\/td>/),
    purchaseMin: pick(html, /申购起点<\/td><td class="w135">([^<]*)<\/td>/),
    mgmtFee: pick(html, /管理费率<\/td><td class="w135">([^<]*)<\/td>/),
    custodyFee: pick(html, /托管费率<\/td><td class="w135">([^<]*)<\/td>/),
    salesFee: pick(html, /销售服务费率<\/td><td class="w135">([^<]*)<\/td>/),
    establishDate: pick(html, /成立日期：<span>([\d-]+)<\/span>/),
    fundType: pick(html, /类型：<span>([^<]*)<\/span>/),
    manager: pick(html, /管理人：<a[^>]*>([^<]*)<\/a>/),
    scale: scaleM ? scaleM[1] : '',
    scaleDate: scaleM ? scaleM[2] : ''
  };
}

/* 抓取单只基金详情（含限流重试：页面缺少“申购状态”即视为被限流） */
async function fetchDetail(code) {
  const url = 'http://fundf10.eastmoney.com/jjfl_' + code + '.html';
  for (let attempt = 0; attempt < 3; attempt++) {
    const html = await fetchText(url);
    if (html && html.indexOf('申购状态') >= 0) {
      return parseDetail(html, code);
    }
    await sleep(1200 + attempt * 900);
  }
  throw new Error('页面内容异常（可能被限流）');
}

/* 全量抓取（并发 2、单个间隔 900ms，降低对源站压力、避免限流） */
async function scrapeAll(list = FUND_LIST, onProgress) {
  const etfCodes = list.filter((it) => it[3] === 'ETF').map((it) => it[0]);
  const premiumMap = await fetchEtfPremium(etfCodes);

  const results = new Array(list.length);
  let i = 0;
  const CONCURRENCY = 2;
  async function worker() {
    while (i < list.length) {
      const idx = i++;
      const it = list[idx];
      const code = it[0];
      const base = { code, name: it[1], company: it[2], cat: it[3], ccy: it[4], cls: it[5], index: it[6] };
      try {
        const detail = await fetchDetail(code);
        const extra = { trackingError: await fetchTrackingError(code) };
        if (it[3] === 'ETF') {
          const pm = premiumMap[code] || {};
          extra.iopv = pm.iopv != null ? pm.iopv : '';
          extra.premium = pm.premium != null ? pm.premium : '';
          extra.priceDate = pm.priceDate || '';
        }
        results[idx] = Object.assign(base, detail, extra);
      } catch (e) {
        results[idx] = Object.assign(base, { error: e.message });
      }
      if (onProgress) onProgress(idx + 1, list.length, it[1]);
      await sleep(900);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return results;
}

/* CloudBase 云函数入口（HTTP / 定时触发通用） */
async function main(event, context) {
  const data = await scrapeAll();
  const updated = new Date().toISOString();
  const summary = {
    updated,
    total: data.length,
    ok: data.filter((d) => !d.error).length,
    fail: data.filter((d) => d.error).length
  };

  // 部署到 CloudBase 后自动写入云数据库集合 nasdaq_funds（以基金代码作 _id 幂等写入）
  // 本地运行无 @cloudbase/node-sdk 时自动跳过，不影响返回值。
  try {
    const cloudbase = require('@cloudbase/node-sdk');
    const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
    const db = app.database();
    try {
      await db.createCollection('nasdaq_funds');
    } catch (e) {
      // 集合已存在时忽略
    }
    const coll = db.collection('nasdaq_funds');
    for (const row of data) {
      await coll.doc(row.code).set(Object.assign({}, row, { updated }));
    }
    summary.persisted = true;
  } catch (e) {
    summary.persisted = false;
    summary.persistError = e.message;
  }
  return { summary, data };
}

module.exports = { FUND_LIST, scrapeAll, parseDetail, fetchEtfPremium, fetchTrackingError, main };
