/**
 * 本地 / GitHub Actions 运行：抓取美股主要指数（纳指100 / 标普500 / 道指）行情，
 * 生成 js/index-quotes.js，供 admin.html「指数速览」页面直接加载。
 *
 * 用法：node scripts/run-fetch-index.js
 *
 * 数据源：腾讯行情（qt.gtimg.cn）为主，失败时自动回退新浪行情（hq.sinajs.cn）。
 *        两家都能提供正确的纳斯达克100；东方财富 100.NDX 实际返回的是纳指综合，
 *        口径不符，故不再使用。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

/* 需要覆盖的指数（tx 为腾讯行情代码，sina 为新浪行情代码，key 为生成对象键名） */
const INDEXES = [
  { secid: '100.NDX', tx: 'usNDX', sina: 'gb_$ndx', key: 'NDX', name: '纳斯达克100' },
  { secid: '100.SPX', tx: 'usINX', sina: 'gb_$inx', key: 'SPX', name: '标普500' },
  { secid: '100.DJIA', tx: 'usDJI', sina: 'gb_$dji', key: 'DJIA', name: '道琼斯工业' }
];

function fetchTextOnce(url, referer) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
    };
    if (referer) headers.Referer = referer;
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers,
      timeout: 20000
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.end();
  });
}

/* 数据源偶发连接重置（ECONNRESET），退避重试提高稳定性 */
function withRetry(fn, retries) {
  var left = retries == null ? 3 : retries;
  return fn().catch(function (e) {
    var retryable = /ECONNRESET|socket hang up|timeout/i.test(e && e.message);
    if (retryable && left > 0) {
      return new Promise(function (r) { setTimeout(r, 2000); })
        .then(function () { return withRetry(fn, left - 1); });
    }
    throw e;
  });
}

function round(n, digits) {
  const k = Math.pow(10, digits || 2);
  return Math.round(n * k) / k;
}

function num(v) {
  const n = parseFloat(v);
  return isFinite(n) ? n : null;
}

/* 腾讯行情：v_usNDX="200~纳斯达克100~.NDX~价~昨收~开~...~时间~涨跌额~涨跌幅~最高~最低~..." */
async function fetchQuotesTencent() {
  const codes = INDEXES.map((i) => i.tx).join(',');
  const text = await withRetry(() => fetchTextOnce('https://qt.gtimg.cn/q=' + codes));
  const byCode = {};
  const re = /v_([A-Za-z0-9_]+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(text))) byCode[m[1]] = m[2].split('~');

  const result = {};
  for (const idx of INDEXES) {
    const f = byCode[idx.tx];
    const price = f ? num(f[3]) : null;
    if (!f || price == null) {
      result[idx.key] = { code: idx.key, secid: idx.secid, name: idx.name, error: '未获取到行情' };
      continue;
    }
    const prevClose = num(f[4]);
    const change = num(f[31]);
    const pct = num(f[32]);
    result[idx.key] = {
      code: idx.key,
      secid: idx.secid,
      name: idx.name,
      price,
      prevClose,
      change: change != null ? round(change) : (prevClose != null ? round(price - prevClose) : null),
      pct: pct != null ? round(pct) : (prevClose ? round((price - prevClose) / prevClose * 100) : null),
      high: num(f[33]),
      low: num(f[34]),
      open: num(f[5])
    };
  }
  return result;
}

/* 新浪行情：var hq_str_gb_$ndx="名称,价,涨跌幅,时间,涨跌额,开,高,低,...,昨收,..." */
async function fetchQuotesSina() {
  const codes = INDEXES.map((i) => i.sina).join(',');
  const text = await withRetry(() => fetchTextOnce('https://hq.sinajs.cn/list=' + codes, 'https://finance.sina.com.cn'));
  const byCode = {};
  const re = /hq_str_([A-Za-z0-9_$]+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(text))) byCode[m[1]] = m[2].split(',');

  const result = {};
  for (const idx of INDEXES) {
    const f = byCode[idx.sina];
    const price = f ? num(f[1]) : null;
    if (!f || price == null) {
      result[idx.key] = { code: idx.key, secid: idx.secid, name: idx.name, error: '未获取到行情' };
      continue;
    }
    const change = num(f[4]);
    const pct = num(f[2]);
    const prevClose = num(f[26]);
    const r2 = (v) => (v == null ? null : round(v));
    result[idx.key] = {
      code: idx.key,
      secid: idx.secid,
      name: idx.name,
      price: round(price),
      prevClose: prevClose != null ? round(prevClose) : (change != null ? round(price - change) : null),
      change: change != null ? round(change) : null,
      pct: pct != null ? round(pct) : null,
      high: r2(num(f[6])),
      low: r2(num(f[7])),
      open: r2(num(f[5]))
    };
  }
  return result;
}

const SOURCES = [
  { name: '腾讯行情', fn: fetchQuotesTencent },
  { name: '新浪行情', fn: fetchQuotesSina }
];

async function run() {
  console.log('开始抓取美股主要指数行情...');
  let quotes = null;
  let lastErr = null;
  for (const src of SOURCES) {
    try {
      const q = await src.fn();
      if (INDEXES.some((i) => q[i.key] && q[i.key].price != null)) {
        quotes = q;
        console.log('  数据源：' + src.name);
        break;
      }
      lastErr = new Error('返回数据为空');
      console.log('  ' + src.name + ' 返回数据为空，尝试下一个数据源');
    } catch (e) {
      lastErr = e;
      console.log('  ' + src.name + ' 不可用（' + e.message + '），尝试下一个数据源');
    }
  }
  if (!quotes) throw lastErr || new Error('所有数据源均不可用');

  const updated = new Date();
  const human = updated.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });

  const out = [
    '/* 本文件由 scripts/run-fetch-index.js 自动生成，请勿手动修改 */',
    '/* 生成时间：' + human + '（Asia/Shanghai） */',
    'window.INDEX_QUOTES_UPDATED = "' + human + '";',
    'window.INDEX_QUOTES = ' + JSON.stringify(quotes, null, 2) + ';',
    ''
  ].join('\n');

  const dest = path.join(__dirname, '..', 'js', 'index-quotes.js');
  fs.writeFileSync(dest, out, 'utf8');

  INDEXES.forEach((idx) => {
    const q = quotes[idx.key];
    if (q && q.price != null) {
      console.log('  ' + q.name + ' (' + q.code + ')：' + q.price +
        '  涨跌 ' + (q.change >= 0 ? '+' : '') + q.change +
        '（' + (q.pct >= 0 ? '+' : '') + q.pct + '%）');
    } else {
      console.log('  ' + q.name + ' (' + q.code + ')：' + (q.error || '无数据'));
    }
  });
  console.log('已写入 ' + dest + '（更新时间 ' + human + '）');
}

run().catch((e) => { console.error(e); process.exit(1); });