/**
 * 美股主要指数（纳指100 / 标普500 / 道指）行情 —— 定时抓取 + 入库
 *
 * 数据源：东方财富全球指数行情接口（push2.eastmoney.com）
 * 时序：每天 06:00（北京时间）触发，写入云数据库集合 index_quotes（以指数代码作 _id，幂等写入）
 *
 * 可复用：
 *   1. CloudBase 云函数（导出 main，配置 timer 触发器）
 *   2. 本地脚本（scripts/run-fetch-index.js 已含等价抓取逻辑，生成 js/index-quotes.js）
 */
'use strict';

const https = require('https');
const { URL } = require('url');

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

function fetchJSON(url, retries) {
  let left = retries == null ? 3 : retries;
  return fetchJSONOnce(url).catch(function (e) {
    const retryable = /ECONNRESET|socket hang up|timeout/i.test(e && e.message);
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
  const url = 'https://push2delay.eastmoney.com/api/qt/ulist.np/get?fltt=2&invt=2&secids=' + secids +
    '&fields=f2,f12,f14,f15,f16,f17,f18';
  const j = await fetchJSON(url);
  const diff = (j && j.data && j.data.diff) || [];
  const arr = Array.isArray(diff) ? diff : Object.values(diff);

  const bySecid = {};
  for (const row of arr) {
    const code = String(row.f12);
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

/* CloudBase 云函数入口（定时触发） */
async function main(event, context) {
  const quotes = await fetchQuotes();
  const now = new Date();
  const human = now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
  const ts = now.getTime();

  const summary = {
    updated: human,
    ok: 0,
    fail: 0
  };
  INDEXES.forEach((idx) => {
    const q = quotes[idx.key];
    if (q && q.price != null) summary.ok++; else summary.fail++;
  });

  // 写入云数据库集合 index_quotes（本地运行无 @cloudbase/node-sdk 时自动跳过）
  try {
    const cloudbase = require('@cloudbase/node-sdk');
    const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
    const db = app.database();
    try {
      await db.createCollection('index_quotes');
    } catch (e) {
      // 集合已存在时忽略
    }
    const coll = db.collection('index_quotes');
    for (const idx of INDEXES) {
      const q = quotes[idx.key] || { code: idx.key, name: idx.name, error: '未获取到行情' };
      await coll.doc(idx.key).set(Object.assign({}, q, { updated: human, ts }));
    }
    summary.persisted = true;
  } catch (e) {
    summary.persisted = false;
    summary.persistError = e.message;
  }
  return { summary, quotes };
}

module.exports = { INDEXES, fetchQuotes, main };