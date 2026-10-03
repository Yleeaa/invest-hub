/**
 * 本地运行：抓取美股主要指数（纳指100 / 标普500 / 纳指综合 / 道指）行情，
 * 生成 js/index-quotes.js，供 admin.html「指数速览」页面直接加载。
 *
 * 用法：node scripts/run-fetch-index.js
 *
 * 数据源：东方财富全球指数行情接口（与 fetch-nasdaq-funds 的 fetchEtfPremium 同一数据源）。
 * 说明：价格按「最新价 - 昨收」自行计算涨跌额与涨跌幅，避免依赖接口 f3/f4 的数值口径。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

/* 需要覆盖的指数（secid 为东方财富全球指数代码，key 为生成对象键名） */
const INDEXES = [
  { secid: '100.NDX', key: 'NDX', name: '纳斯达克100' },
  { secid: '100.SPX', key: 'SPX', name: '标普500' },
  { secid: '100.DJIA', key: 'DJIA', name: '道琼斯工业' }
];

function fetchJSONOnce(url) {
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

/* 数据源偶发连接重置（ECONNRESET），退避重试提高稳定性 */
function fetchJSON(url, retries) {
  var left = retries == null ? 3 : retries;
  return fetchJSONOnce(url).catch(function (e) {
    var retryable = /ECONNRESET|socket hang up|timeout/i.test(e && e.message);
    if (retryable && left > 0) {
      return new Promise(function (r) { setTimeout(r, 2000); })
        .then(function () { return fetchJSON(url, left - 1); });
    }
    throw e;
  });
}

function round(n, digits) {
  const k = Math.pow(10, digits || 2);
  return Math.round(n * k) / k;
}

async function fetchQuotes() {
  const secids = INDEXES.map((i) => i.secid).join(',');
  const url = 'https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&invt=2&secids=' + secids +
    '&fields=f2,f12,f14,f15,f16,f17,f18';
  const j = await fetchJSON(url);
  const diff = (j && j.data && j.data.diff) || [];
  const arr = Array.isArray(diff) ? diff : Object.values(diff);

  // 先按 secid（市场+代码）建立索引，兼容接口返回顺序与请求顺序不一致的情况
  const bySecid = {};
  for (const row of arr) {
    const code = String(row.f12);
    // 全球指数 f13 通常为 100，此处用请求时约定的 secid 前缀兜底
    bySecid['100.' + code] = row;
  }

  const result = {};
  for (const idx of INDEXES) {
    const row = bySecid[idx.secid];
    if (!row) {
      result[idx.key] = { code: idx.key, secid: idx.secid, name: idx.name, error: '未获取到行情' };
      continue;
    }
    const price = typeof row.f2 === 'number' ? row.f2 : null;
    const prevClose = typeof row.f18 === 'number' ? row.f18 : null;
    const change = (price != null && prevClose != null) ? round(price - prevClose) : null;
    const pct = (change != null && prevClose) ? round((change / prevClose) * 100) : null;
    result[idx.key] = {
      code: idx.key,
      secid: idx.secid,
      name: idx.name,
      price,
      prevClose,
      change,
      pct,
      high: row.f15,
      low: row.f16,
      open: row.f17
    };
  }
  return result;
}

async function run() {
  console.log('开始抓取美股主要指数行情...');
  const quotes = await fetchQuotes();
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