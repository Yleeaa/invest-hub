/**
 * 本地运行：抓取纳斯达克100基金数据，生成 js/nasdaq-funds.js（供静态页面直接加载）
 * 用法：node scripts/run-fetch-local.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { scrapeAll } = require('../cloudfunctions/fetch-nasdaq-funds/index.js');

/* 从已有的 js/nasdaq-funds.js 读取上一版数据（按代码索引） */
function loadPrevFunds(dest) {
  try {
    if (!fs.existsSync(dest)) return {};
    const src = fs.readFileSync(dest, 'utf8');
    const m = src.match(/window\.NASDAQ_FUNDS = (\[[\s\S]*?\]);/);
    if (!m) return {};
    const map = {};
    JSON.parse(m[1]).forEach((f) => { map[f.code] = f; });
    return map;
  } catch (e) {
    console.log('  [提示] 读取上一版数据失败，将无“昨日限购”对比：' + e.message);
    return {};
  }
}

async function run() {
  console.log('开始抓取纳斯达克100基金数据...');
  const data = await scrapeAll(undefined, (done, total, name) => {
    process.stdout.write('\r进度 ' + done + '/' + total + '  ' + name + '          ');
  });
  console.log('');

  const dest = path.join(__dirname, '..', 'js', 'nasdaq-funds.js');

  // 读取上一版数据：为场外基金补充“昨日限购”，并在溢价率抓取失败时保留旧值
  const prevMap = loadPrevFunds(dest);
  data.forEach((f) => {
    const p = prevMap[f.code];
    if (!p) return;
    if (f.cat !== 'ETF') {
      f.prevPurchaseStatus = (p.purchaseStatus || '').trim();
      f.prevDailyLimit = (p.dailyLimit || '').trim();
    } else if ((f.premium === '' || f.premium == null) && p.premium != null && p.premium !== '') {
      f.iopv = p.iopv;
      f.premium = p.premium;
      f.priceDate = p.priceDate;
    }
  });

  const updated = new Date();
  const stamp = updated.toISOString();
  const human = updated.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });

  const out = [
    '/* 本文件由 scripts/run-fetch-local.js 自动生成，请勿手动修改 */',
    '/* 生成时间：' + human + '（Asia/Shanghai） */',
    'window.NASDAQ_FUNDS_UPDATED = "' + human + '";',
    'window.NASDAQ_FUNDS = ' + JSON.stringify(data, null, 2) + ';',
    ''
  ].join('\n');

  fs.writeFileSync(dest, out, 'utf8');

  const ok = data.filter((d) => !d.error).length;
  const fail = data.length - ok;
  console.log('完成：共 ' + data.length + ' 只，成功 ' + ok + '，失败 ' + fail);
  if (fail > 0) {
    data.filter((d) => d.error).forEach((d) => console.log('  [失败] ' + d.code + ' ' + d.name + '：' + d.error));
  }
  console.log('已写入 ' + dest + '（更新时间 ' + human + '）');
}

run().catch((e) => { console.error(e); process.exit(1); });
