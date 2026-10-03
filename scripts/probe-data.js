'use strict';
const https = require('https');
const { URL } = require('url');

function fetchRaw(url, referer) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive',
        'Referer': referer || 'https://quote.eastmoney.com/'
      },
      timeout: 15000
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', (e) => resolve({ status: -1, body: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: -2, body: 'timeout' }); });
    req.end();
  });
}

(async () => {
  // 1) 单只 stock/get
  const r1 = await fetchRaw('https://push2delay.eastmoney.com/api/qt/stock/get?secid=1.513100&fields=f2,f12,f297,f402,f441');
  console.log('=== stock/get 1.513100 status=' + r1.status);
  console.log(r1.body.replace(/\s+/g, ' ').slice(0, 400));
  console.log('');

  // 2) ulist.np/get 多只
  const secids = '1.513100,1.513110,1.513300,1.513390,1.513870,0.159501,0.159513,0.159632,0.159659,0.159660,0.159696,0.159941';
  const r2 = await fetchRaw('https://push2delay.eastmoney.com/api/qt/ulist.np/get?fltt=2&invt=2&secids=' + secids + '&fields=f2,f12,f13,f297,f402,f441');
  console.log('=== ulist.np/get status=' + r2.status + ' len=' + r2.body.length);
  try {
    const j = JSON.parse(r2.body);
    const diff = (j && j.data && j.data.diff) || [];
    const arr = Array.isArray(diff) ? diff : Object.values(diff);
    console.log('arr=' + arr.length);
    for (const h of arr) console.log('  ' + h.f12 + ' 价=' + h.f2 + ' IOPV=' + h.f441 + ' 折价率=' + h.f402 + ' 日期=' + h.f297);
  } catch (e) {
    console.log('JSON fail: ' + e.message);
    console.log(r2.body.slice(0, 300));
  }
})();
