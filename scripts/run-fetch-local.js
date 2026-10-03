/**
 * 本地运行：抓取纳斯达克100基金数据，生成 js/nasdaq-funds.js（供静态页面直接加载）
 * 用法：node scripts/run-fetch-local.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { scrapeAll } = require('../cloudfunctions/fetch-nasdaq-funds/index.js');

async function run() {
  console.log('开始抓取纳斯达克100基金数据...');
  const data = await scrapeAll(undefined, (done, total, name) => {
    process.stdout.write('\r进度 ' + done + '/' + total + '  ' + name + '          ');
  });
  console.log('');

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

  const dest = path.join(__dirname, '..', 'js', 'nasdaq-funds.js');
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
