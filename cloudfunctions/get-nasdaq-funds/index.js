/**
 * 纳斯达克100基金 —— HTTP 读取接口（HTTP 云函数 / Web 函数）
 * 从云数据库 nasdaq_funds 集合读取最新数据返回给前端页面。
 *
 * HTTP 云函数不会注入默认凭证，需在函数环境变量中配置 CLOUDBASE_APIKEY（服务端 API Key）。
 * 部署：tcb fn deploy -e <envId> --httpFn --path /get-nasdaq-funds
 */
'use strict';

const http = require('http');
const cloudbase = require('@cloudbase/node-sdk');

const PORT = 9000;
const ENV_ID = 'ceshi-1-d1g0czdaa999081f4';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function json(res, statusCode, payload) {
  res.writeHead(statusCode, Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, CORS));
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    json(res, 405, { code: -1, message: 'method not allowed', data: [] });
    return;
  }
  try {
    const initOptions = { env: ENV_ID };
    if (process.env.CLOUDBASE_APIKEY) initOptions.accessKey = process.env.CLOUDBASE_APIKEY;
    const app = cloudbase.init(initOptions);
    const r = await app.database().collection('nasdaq_funds').limit(1000).get();
    const rows = (r && r.data) || [];
    let updated = '';
    rows.forEach((x) => { if (x.updated && x.updated > updated) updated = x.updated; });
    json(res, 200, { code: 0, updated, total: rows.length, data: rows });
  } catch (e) {
    json(res, 500, { code: -1, message: e.message, data: [] });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('get-nasdaq-funds listening on port ' + PORT);
});
