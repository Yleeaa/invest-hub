/* ===== 示例数据（实际使用时由后台录入） ===== */
const SAMPLE_HOLDINGS = [
    {
        "id": 1,
        "code": "510300",
        "name": "沪深300ETF",
        "market": "A",
        "type": "股票",
        "shares": 10000,
        "cost": 3.85,
        "price": 4.12
    },
    {
        "id": 2,
        "code": "510500",
        "name": "中证500ETF",
        "market": "A",
        "type": "股票",
        "shares": 5000,
        "cost": 5.2,
        "price": 5.68
    },
    {
        "id": 3,
        "code": "513500",
        "name": "标普500ETF",
        "market": "美",
        "type": "股票",
        "shares": 3000,
        "cost": 1.85,
        "price": 2.12
    },
    {
        "id": 4,
        "code": "513100",
        "name": "纳斯达克100ETF",
        "market": "美",
        "type": "股票",
        "shares": 2000,
        "cost": 2.5,
        "price": 3.05
    },
    {
        "id": 5,
        "code": "513880",
        "name": "日经225ETF",
        "market": "日",
        "type": "股票",
        "shares": 2000,
        "cost": 1.45,
        "price": 1.62
    },
    {
        "id": 6,
        "code": "019547",
        "name": "22国债05",
        "market": "A",
        "type": "债券",
        "shares": 100,
        "cost": 100.5,
        "price": 101.2
    },
    {
        "id": 7,
        "code": "518880",
        "name": "黄金ETF",
        "market": "A",
        "type": "黄金",
        "shares": 1000,
        "cost": 4.2,
        "price": 4.65
    },
    {
        "id": 8,
        "code": "CASH",
        "name": "现金（人民币）",
        "market": "A",
        "type": "现金",
        "shares": 1,
        "cost": 50000,
        "price": 50000
    }
];

/* ===== 交易记录示例 ===== */
const SAMPLE_TRADES = {
    "510300": [
        {
            "date": "2024-03-15",
            "type": "买入",
            "price": 3.85,
            "shares": 5000,
            "reason": "市场调整，沪深300估值进入历史30%分位以下，分批建仓。"
        },
        {
            "date": "2024-05-20",
            "type": "买入",
            "price": 3.75,
            "shares": 5000,
            "reason": "继续下跌，加仓摊低成本，长期看好大盘核心资产。"
        },
        {
            "date": "2024-08-10",
            "type": "买入",
            "price": 3.9,
            "shares": 2000,
            "reason": "反弹初期，仓位不足小幅加仓。"
        }
    ],
    "513500": [
        {
            "date": "2024-02-08",
            "type": "买入",
            "price": 1.92,
            "shares": 1500,
            "reason": "美股回调，标普500 PE回到合理区间，启动定投。"
        },
        {
            "date": "2024-06-12",
            "type": "买入",
            "price": 1.78,
            "shares": 1500,
            "reason": "继续下跌，加大美股配置比例。"
        }
    ],
    "518880": [
        {
            "date": "2024-04-22",
            "type": "买入",
            "price": 4.35,
            "shares": 500,
            "reason": "地缘风险升温，黄金避险价值凸显，配置5%对冲。"
        },
        {
            "date": "2024-09-05",
            "type": "买入",
            "price": 4.1,
            "shares": 500,
            "reason": "降息预期加强，金价回调加仓。"
        }
    ],
    "019547": [
        {
            "date": "2024-01-10",
            "type": "买入",
            "price": 100.5,
            "shares": 100,
            "reason": "锁定高利率，债券作为防御性资产配置。"
        }
    ]
};

/* ===== 收益历史数据（用于绘制曲线） ===== */
const SAMPLE_RETURNS = {
    "week": [
        {
            "date": "08-26",
            "value": 100
        },
        {
            "date": "08-27",
            "value": 100.3
        },
        {
            "date": "08-28",
            "value": 99.8
        },
        {
            "date": "08-29",
            "value": 100.1
        },
        {
            "date": "08-30",
            "value": 100.6
        },
        {
            "date": "09-02",
            "value": 100.9
        },
        {
            "date": "09-03",
            "value": 101.2
        }
    ],
    "month": [
        {
            "date": "08-05",
            "value": 100
        },
        {
            "date": "08-12",
            "value": 100.5
        },
        {
            "date": "08-19",
            "value": 99.8
        },
        {
            "date": "08-26",
            "value": 100.2
        },
        {
            "date": "09-02",
            "value": 101.2
        }
    ],
    "year": [
        {
            "date": "01月",
            "value": 100
        },
        {
            "date": "02月",
            "value": 102.5
        },
        {
            "date": "03月",
            "value": 104.8
        },
        {
            "date": "04月",
            "value": 103.2
        },
        {
            "date": "05月",
            "value": 106.1
        },
        {
            "date": "06月",
            "value": 108.5
        },
        {
            "date": "07月",
            "value": 107.2
        },
        {
            "date": "08月",
            "value": 109.8
        },
        {
            "date": "09月",
            "value": 112.3
        }
    ]
};

/* ===== 投资标的类型 ===== */
const INV_TYPES = [
    "债券",
    "偏债",
    "A股",
    "港股",
    "美股",
    "日股"
];

/* ===== 投资分类（用于持仓明细聚合展示） ===== */
const INV_CATEGORIES = [
    "债券",
    "偏债",
    "纳斯达克",
    "标普500",
    "恒生科技",
    "红利低波",
    "日股"
];

/* ===== 投资分类备注 ===== */
const INV_CATEGORY_NOTES = {
    "标普500": "日定投：110元",
    "红利低波": "日定投：10元",
    "日股": "日定投：20元",
    "纳斯达克": "日定投：35元"
};

/* ===== 持仓数据更新记录 ===== */
const HOLDINGS_UPDATE = {
    "date": "2026-10-03",
    "note": ""
};

/* ===== 投资标的数据 ===== */
const INV_TARGETS = [
    {
        "type": "债券",
        "category": "债券",
        "code": "006792",
        "name": "长城短债债券D",
        "marketValue": 10061.06,
        "profit": 61.06,
        "cost": 10000,
        "dailyInvest": 0,
        "remark": ""
    },
    {
        "type": "债券",
        "category": "债券",
        "code": "006791",
        "name": "长城短债债券A",
        "marketValue": 5027.4,
        "profit": 27.4,
        "cost": 5000,
        "dailyInvest": 0,
        "remark": ""
    },
    {
        "type": "债券",
        "category": "债券",
        "code": "003102",
        "name": "长盛盛裕纯债债券D",
        "marketValue": 6036.45,
        "profit": 36.45,
        "cost": 6000,
        "dailyInvest": 0,
        "remark": ""
    },
    {
        "type": "债券",
        "category": "债券",
        "code": "400030",
        "name": "东方添益债券",
        "marketValue": 5058.22,
        "profit": 58.22,
        "cost": 5000,
        "dailyInvest": 0,
        "remark": ""
    },
    {
        "type": "债券",
        "category": "债券",
        "code": "007861",
        "name": "鹏华丰享债券",
        "marketValue": 5044.49,
        "profit": 44.49,
        "cost": 5000,
        "dailyInvest": 0,
        "remark": ""
    },
    {
        "type": "偏债",
        "category": "偏债",
        "code": "001837",
        "name": "易方达瑞锦灵活配置混合A",
        "marketValue": 10047.44,
        "profit": 47.44,
        "cost": 10000,
        "dailyInvest": 0,
        "remark": ""
    },
    {
        "type": "偏债",
        "category": "偏债",
        "code": "001838",
        "name": "易方达瑞锦灵活配置混合C",
        "marketValue": 16497.26,
        "profit": -172.53,
        "cost": 16669.789999999997,
        "dailyInvest": 0,
        "remark": ""
    },
    {
        "type": "A股",
        "category": "红利低波",
        "code": "012861",
        "name": "华泰柏瑞中证红利低波动ETF联接A",
        "marketValue": 10720.78,
        "profit": 318.64,
        "cost": 10402.140000000001,
        "dailyInvest": 10,
        "remark": ""
    },
    {
        "type": "港股",
        "category": "恒生科技",
        "code": "015204",
        "name": "南方恒生科技ETF联接(QDII)C",
        "marketValue": 2222.84,
        "profit": -327.16,
        "cost": 2550,
        "dailyInvest": 0,
        "remark": ""
    },
    {
        "type": "美股",
        "category": "标普500",
        "code": "513351",
        "name": "摩根标普500指数(QDII)A",
        "marketValue": 5849.64,
        "profit": 389.64,
        "cost": 5460,
        "dailyInvest": 10,
        "remark": ""
    },
    {
        "type": "美股",
        "category": "纳斯达克",
        "code": "160140",
        "name": "南方纳斯达克100指数(QDII)A",
        "marketValue": 3969.46,
        "profit": 339.46,
        "cost": 3630,
        "dailyInvest": 10,
        "remark": ""
    },
    {
        "type": "美股",
        "category": "纳斯达克",
        "code": "016055",
        "name": "招商纳斯达克100ETF联接(QDII)A",
        "marketValue": 5356.06,
        "profit": 636.06,
        "cost": 4720,
        "dailyInvest": 10,
        "remark": ""
    },
    {
        "type": "美股",
        "category": "纳斯达克",
        "code": "017091",
        "name": "景顺长城纳斯达克科技市值加权ETF联接(QDII)A",
        "marketValue": 3014.54,
        "profit": 654.54,
        "cost": 2360,
        "dailyInvest": 0,
        "remark": ""
    },
    {
        "type": "日股",
        "category": "日股",
        "code": "008280",
        "name": "摩根日本精选股票(QDII)A",
        "marketValue": 3610.71,
        "profit": 208.22,
        "cost": 3402.4900000000002,
        "dailyInvest": 10,
        "remark": ""
    },
    {
        "type": "美股",
        "category": "纳斯达克",
        "code": "270042",
        "name": "广发纳斯达克100ETF联接(QDII)A",
        "marketValue": 94.43,
        "profit": 2.43,
        "cost": 92,
        "dailyInvest": 0,
        "remark": ""
    },
    {
        "type": "美股",
        "category": "纳斯达克",
        "code": "160213",
        "name": "国泰纳斯达克100指数(QDII)",
        "marketValue": 1836.59,
        "profit": 36.59,
        "cost": 1800,
        "dailyInvest": 0,
        "remark": ""
    },
    {
        "type": "日股",
        "category": "日股",
        "code": "020712",
        "name": "华安三菱日联日经225ETF联接(QDII)A",
        "marketValue": 234.37,
        "profit": 4.37,
        "cost": 230,
        "dailyInvest": 10,
        "remark": ""
    },
    {
        "type": "美股",
        "category": "纳斯达克",
        "code": "000834",
        "name": "大成纳斯达克100ETF联接(QDII)A",
        "marketValue": 162.14,
        "profit": 2.14,
        "cost": 160,
        "dailyInvest": 10,
        "remark": ""
    },
    {
        "type": "美股",
        "category": "纳斯达克",
        "code": "040046",
        "name": "华安纳斯达克100ETF联接(QDII)A",
        "marketValue": 142.73,
        "profit": 2.73,
        "cost": 140,
        "dailyInvest": 5,
        "remark": ""
    },
    {
        "type": "美股",
        "category": "标普500",
        "code": "096001",
        "name": "大成标普500等权重指数(QDII)A",
        "marketValue": 783.09,
        "profit": -6.91,
        "cost": 790,
        "dailyInvest": 100,
        "remark": ""
    }
];

/* ===== 现金数据 ===== */
const CASH = [
    {
        "name": "余额宝",
        "amount": 6467.86,
        "remark": ""
    }
];

/* ===== 年度收益汇总数据 ===== */
const ANNUAL_RETURNS = [
    {
        "year": "2026",
        "realizedProfit": -128.58,
        "capital": 100000,
        "note": ""
    }
];

/* ===== 月度收益数据（用于绘制收益波动曲线） ===== */
const MONTHLY_RETURNS = [
    {
        "year": "2026",
        "month": 1,
        "profit": 436.18,
        "note": ""
    },
    {
        "year": "2026",
        "month": 2,
        "profit": -514.59,
        "note": ""
    },
    {
        "year": "2026",
        "month": 3,
        "profit": -1145.93,
        "note": ""
    },
    {
        "year": "2026",
        "month": 4,
        "profit": 1961.78,
        "note": ""
    },
    {
        "year": "2026",
        "month": 5,
        "profit": 1273.61,
        "note": ""
    },
    {
        "year": "2026",
        "month": 6,
        "profit": -595.28,
        "note": ""
    },
    {
        "year": "2026",
        "month": 7,
        "profit": 38.64,
        "note": ""
    },
    {
        "year": "2026",
        "month": 8,
        "profit": 833.34,
        "note": ""
    },
    {
        "year": "2026",
        "month": 9,
        "profit": -53.05,
        "note": ""
    }
];

/* ===== 已清仓标的记录 ===== */
const CLOSED_POSITIONS = [
    {
        "type": "A股",
        "code": "600519",
        "name": "2026已清仓标的汇总",
        "cost": 10000,
        "soldValue": 10500,
        "profit": 500,
        "closeDate": "2026-07-10",
        "note": ""
    }
];

/* ===== 实盘周记配置 ===== */
const WEEKLY_CONFIG = {
    "startDate": "2026-09-01",
    "author": "叨居"
};

/* ===== 实盘周记存档（coverUrl/pushedAt/draftMediaId 为草稿箱推送预留字段） ===== */
const WEEKLY_POSTS = [
    {
        "week": 5,
        "date": "2026-10-03",
        "title": "实盘周记｜第5周｜自建网站丨-40.19元，持仓涨跌不一，大家国庆快乐！",
        "essay": "本周持仓整体涨跌幅如下\n纳斯达克：-0.55%，\n标普500：-0.8%\n恒生科技：-2.94%\n红利低波：+1.09%\n日股：+1.99%\n",
        "weeklyProfit": -40.19,
        "weeklyRate": null,
        "snapshot": {
            "totalAsset": 102237.55999999998,
            "totalMarket": 95769.69999999998,
            "totalCash": 6467.86,
            "totalProfit": 2363.2799999999997,
            "totalProfitRate": 0.024676698371196737,
            "bondPct": 56.50792135493064,
            "equityPct": 37.16577351806911,
            "targetCount": 20
        },
        "html": "<p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">大家好，这里是<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">叨居</strong>，欢迎来到我的投资纪实记录。</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">经过一段时间准备，我的个人记录网站「<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">投么有度</strong>」开启长期实盘更新。<br>从2026年开始，我计划用二十年时间，慢慢实践属于自己的退休积累计划。<br>投资对于我而言，永远只是生活的附属，<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">生活大于投资</strong>，也是我一直坚持的核心理念。</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">这是开始分享实盘周记的<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">第5周</strong>。</p><section style=\"display:inline-block;margin:30px 0 14px;padding:5px 14px;background:#f3ecdc;border-left:4px solid #c9a961;font-weight:700;font-size:16px;line-height:1.6;color:#7a5c28;\">本周账户概况（更新日期：2026-10-03）</section><section style=\"margin:14px 0 18px;padding:16px 12px;background:#f5faf5;border:1px solid #d8ecd8;border-radius:8px;text-align:center;\"><span style=\"font-size:13px;color:#7a6a45;\">本 周 收 益</span><br><strong style=\"font-size:24px;line-height:1.5;color:#0a7d48;\">¥ -40.19</strong></section><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">初始本金：<strong>¥ 100,000.00</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">总资产：<strong>¥ 102,237.56</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">组合总市值：<strong>¥ 95,769.70</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">现金：<strong>¥ 6,467.86</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">累计持仓收益：<strong style=\"color:#c00000;\">¥ +2,363.28</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">累计持仓收益率：<strong style=\"color:#c00000;\">+2.47%</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">当前资产配比：</p><section style=\"margin:6px 0;padding:10px 14px;background:#faf7f0;border-left:4px solid #c9a961;border-radius:4px;font-size:14px;line-height:1.8;color:#7a6a45;\">债券类占比：56.5%</section><section style=\"margin:6px 0;padding:10px 14px;background:#faf7f0;border-left:4px solid #c9a961;border-radius:4px;font-size:14px;line-height:1.8;color:#7a6a45;\">权益类占比：37.2%</section><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">现阶段处于<strong>积累期</strong>，我的配置思路以平衡收益与波动为主，采用偏稳健的股债搭配，不追求短期暴利，优先控制回撤，着眼几十年的长期复利。</p><section style=\"display:inline-block;margin:30px 0 14px;padding:5px 14px;background:#f3ecdc;border-left:4px solid #c9a961;font-weight:700;font-size:16px;line-height:1.6;color:#7a5c28;\">本周复盘</section><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">本周持仓整体涨跌幅如下</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">纳斯达克：-0.55%，</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">标普500：-0.8%</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">恒生科技：-2.94%</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">红利低波：+1.09%</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">日股：+1.99%</p><section style=\"display:inline-block;margin:30px 0 14px;padding:5px 14px;background:#f3ecdc;border-left:4px solid #c9a961;font-weight:700;font-size:16px;line-height:1.6;color:#7a5c28;\">重要声明</section><section style=\"margin-top:30px;padding:14px 16px;background:#fafafa;border:1px solid #ececec;border-radius:6px;font-size:13px;line-height:1.8;color:#999;\">所有内容仅属于我个人的投资成长记录，不构成任何投资建议。市场有风险，入市需谨慎。</section><p style=\"margin:26px 0 0;font-size:13px;line-height:1.8;color:#999;\">更多长期投资思考与复盘笔记，会持续更新于此。</p><section style=\"margin:30px 0 0;padding:16px 18px;background:#faf7f0;border:1px solid #e8dfc8;border-radius:8px;text-align:center;font-size:14px;line-height:2.2;color:#7a6a45;\"><strong style=\"font-size:15px;\">每周更新实盘周记，欢迎关注</strong><br><span style=\"font-size:13px;\">公众号：叨居　|　B站：投么有度</span><br><span style=\"font-size:13px;color:#8a7a55;\">往后每周，我都会在这里同步账户最新情况，记录一路上的思考、犯错与成长。<br>完整的数据演示页面，可访问个人网站【投么有度】查看。<br>视频版本同步更新在B站，搜索「投么有度」即可观看。</span></section>",
        "coverUrl": "",
        "pushedAt": "",
        "draftMediaId": ""
    },
    {
        "week": 4,
        "date": "2026-09-25",
        "title": "实盘周记｜第4周｜自建网站丨+326.08元，投资之余，记得生活，大家中秋快乐",
        "essay": "美股本周又创新高，场外基金的外汇额度却持续收紧，场内高溢价，投资面临两难选择\nA股、港股、日股本周有不同程度的回调\n不预测，按既定计划定投\n中秋佳节，中秋快乐~\n\n\n",
        "weeklyProfit": 326.08,
        "weeklyRate": null,
        "snapshot": {
            "totalAsset": 102276.73999999999,
            "totalMarket": 95284.88999999998,
            "totalCash": 6991.85,
            "totalProfit": 2403.4699999999993,
            "totalProfitRate": 0.025224041293430675,
            "bondPct": 56.55751249013217,
            "equityPct": 36.60628017670489,
            "targetCount": 20
        },
        "html": "<p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">大家好，这里是<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">叨居</strong>，欢迎来到我的投资纪实记录。</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">经过一段时间准备，我的个人记录网站「<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">投么有度</strong>」开启长期实盘更新。<br>从2026年开始，我计划用二十年时间，慢慢实践属于自己的退休积累计划。<br>投资对于我而言，永远只是生活的附属，<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">生活大于投资</strong>，也是我一直坚持的核心理念。</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">这是开始分享实盘周记的<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">第4周</strong>。</p><section style=\"display:inline-block;margin:30px 0 14px;padding:5px 14px;background:#f3ecdc;border-left:4px solid #c9a961;font-weight:700;font-size:16px;line-height:1.6;color:#7a5c28;\">本周账户概况（更新日期：2026-09-25）</section><section style=\"margin:14px 0 18px;padding:16px 12px;background:#fdf6f6;border:1px solid #f2d9d9;border-radius:8px;text-align:center;\"><span style=\"font-size:13px;color:#7a6a45;\">本 周 收 益</span><br><strong style=\"font-size:24px;line-height:1.5;color:#c00000;\">+¥ 326.08</strong></section><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">初始本金：<strong>¥ 100,000.00</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">总资产：<strong>¥ 102,276.74</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">组合总市值：<strong>¥ 95,284.89</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">现金：<strong>¥ 6,991.85</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">累计持仓收益：<strong style=\"color:#c00000;\">¥ +2,403.47</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">累计持仓收益率：<strong style=\"color:#c00000;\">+2.52%</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">当前资产配比：</p><section style=\"margin:6px 0;padding:10px 14px;background:#faf7f0;border-left:4px solid #c9a961;border-radius:4px;font-size:14px;line-height:1.8;color:#7a6a45;\">债券类占比：56.6%</section><section style=\"margin:6px 0;padding:10px 14px;background:#faf7f0;border-left:4px solid #c9a961;border-radius:4px;font-size:14px;line-height:1.8;color:#7a6a45;\">权益类占比：36.6%</section><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">现阶段处于<strong>积累期</strong>，我的配置思路以平衡收益与波动为主，采用偏稳健的股债搭配，不追求短期暴利，优先控制回撤，着眼几十年的长期复利。</p><section style=\"display:inline-block;margin:30px 0 14px;padding:5px 14px;background:#f3ecdc;border-left:4px solid #c9a961;font-weight:700;font-size:16px;line-height:1.6;color:#7a5c28;\">本周复盘</section><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">美股本周又创新高，场外基金的外汇额度却持续收紧，场内高溢价，投资面临两难选择</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">A股、港股、日股本周有不同程度的回调</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">不预测，按既定计划定投</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">中秋佳节，中秋快乐~</p><section style=\"display:inline-block;margin:30px 0 14px;padding:5px 14px;background:#f3ecdc;border-left:4px solid #c9a961;font-weight:700;font-size:16px;line-height:1.6;color:#7a5c28;\">重要声明</section><section style=\"margin-top:30px;padding:14px 16px;background:#fafafa;border:1px solid #ececec;border-radius:6px;font-size:13px;line-height:1.8;color:#999;\">所有内容仅属于我个人的投资成长记录，不构成任何投资建议。市场有风险，入市需谨慎。</section><p style=\"margin:26px 0 0;font-size:13px;line-height:1.8;color:#999;\">更多长期投资思考与复盘笔记，会持续更新于此。</p><section style=\"margin:30px 0 0;padding:16px 18px;background:#faf7f0;border:1px solid #e8dfc8;border-radius:8px;text-align:center;font-size:14px;line-height:2.2;color:#7a6a45;\"><strong style=\"font-size:15px;\">每周更新实盘周记，欢迎关注</strong><br><span style=\"font-size:13px;\">公众号：叨居　|　B站：投么有度</span><br><span style=\"font-size:13px;color:#8a7a55;\">往后每周，我都会在这里同步账户最新情况，记录一路上的思考、犯错与成长。<br>完整的数据演示页面，可访问个人网站【投么有度】查看。<br>视频版本同步更新在B站，搜索「投么有度」即可观看。</span></section>",
        "coverUrl": "",
        "pushedAt": "",
        "draftMediaId": ""
    },
    {
        "week": 3,
        "date": "2026-09-19",
        "title": "实盘周记｜第3周｜自建网站丨10万本金退休投资记录",
        "essay": "美联储9月份加息25个基点落地，市场迎来短暂的反弹，但是市场已经预期后面一次的加息概率，目前整体的市场处在动荡的阶段。\n本周操作：\n1、按照计划继续降低偏债的比例，增加现金\n2、调整标的，卖出全部C类的日股，着眼长期持有\n3、继续定投纳斯达克、标普500、红利低波、日股",
        "weeklyProfit": 124.14,
        "weeklyRate": null,
        "snapshot": {
            "totalAsset": 101949.85000000003,
            "totalMarket": 93723.79000000004,
            "totalCash": 8226.06,
            "totalProfit": 2077.3699999999994,
            "totalProfitRate": 0.02216481002315419,
            "bondPct": 56.76146654458047,
            "equityPct": 35.16980162305289,
            "targetCount": 20
        },
        "html": "<p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">大家好，这里是<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">叨居</strong>，欢迎来到我的投资纪实记录。</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">经过一段时间准备，我的个人记录网站「<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">投么有度</strong>」开启长期实盘更新。<br>从2026年开始，我计划用二十年时间，慢慢实践属于自己的退休积累计划。<br>投资对于我而言，永远只是生活的附属，<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">生活大于投资</strong>，也是我一直坚持的核心理念。</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">这是开始分享实盘周记的<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">第3周</strong>。</p><section style=\"display:inline-block;margin:30px 0 14px;padding:5px 14px;background:#f3ecdc;border-left:4px solid #c9a961;font-weight:700;font-size:16px;line-height:1.6;color:#7a5c28;\">本周账户概况（更新日期：2026-09-19）</section><section style=\"margin:14px 0 18px;padding:16px 12px;background:#fdf6f6;border:1px solid #f2d9d9;border-radius:8px;text-align:center;\"><span style=\"font-size:13px;color:#7a6a45;\">本 周 收 益</span><br><strong style=\"font-size:24px;line-height:1.5;color:#c00000;\">+¥ 124.14</strong></section><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">初始本金：<strong>¥ 100,000.00</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">总资产：<strong>¥ 101,949.85</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">组合总市值：<strong>¥ 93,723.79</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">现金：<strong>¥ 8,226.06</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">累计持仓收益：<strong style=\"color:#c00000;\">¥ +2,077.37</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">累计持仓收益率：<strong style=\"color:#c00000;\">+2.22%</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">当前资产配比：</p><section style=\"margin:6px 0;padding:10px 14px;background:#faf7f0;border-left:4px solid #c9a961;border-radius:4px;font-size:14px;line-height:1.8;color:#7a6a45;\">债券类占比：56.8%</section><section style=\"margin:6px 0;padding:10px 14px;background:#faf7f0;border-left:4px solid #c9a961;border-radius:4px;font-size:14px;line-height:1.8;color:#7a6a45;\">权益类占比：35.2%</section><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">现阶段处于<strong>积累期</strong>，我的配置思路以平衡收益与波动为主，采用偏稳健的股债搭配，不追求短期暴利，优先控制回撤，着眼几十年的长期复利。</p><section style=\"display:inline-block;margin:30px 0 14px;padding:5px 14px;background:#f3ecdc;border-left:4px solid #c9a961;font-weight:700;font-size:16px;line-height:1.6;color:#7a5c28;\">本周复盘</section><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">美联储9月份加息25个基点落地，市场迎来短暂的反弹，但是市场已经预期后面一次的加息概率，目前整体的市场处在动荡的阶段。</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">本周操作：</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">1、按照计划继续降低偏债的比例，增加现金</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">2、调整标的，卖出全部C类的日股，着眼长期持有</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">3、继续定投纳斯达克、标普500、红利低波、日股</p><section style=\"display:inline-block;margin:30px 0 14px;padding:5px 14px;background:#f3ecdc;border-left:4px solid #c9a961;font-weight:700;font-size:16px;line-height:1.6;color:#7a5c28;\">重要声明</section><section style=\"margin-top:30px;padding:14px 16px;background:#fafafa;border:1px solid #ececec;border-radius:6px;font-size:13px;line-height:1.8;color:#999;\">所有内容仅属于我个人的投资成长记录，不构成任何投资建议。市场有风险，入市需谨慎。</section><p style=\"margin:26px 0 0;font-size:13px;line-height:1.8;color:#999;\">更多长期投资思考与复盘笔记，会持续更新于此。</p><section style=\"margin:30px 0 0;padding:16px 18px;background:#faf7f0;border:1px solid #e8dfc8;border-radius:8px;text-align:center;font-size:14px;line-height:2.2;color:#7a6a45;\"><strong style=\"font-size:15px;\">每周更新实盘周记，欢迎关注</strong><br><span style=\"font-size:13px;\">公众号：叨居　|　B站：投么有度</span><br><span style=\"font-size:13px;color:#8a7a55;\">往后每周，我都会在这里同步账户最新情况，记录一路上的思考、犯错与成长。<br>完整的数据演示页面，可访问个人网站【投么有度】查看。<br>视频版本同步更新在B站，搜索「投么有度」即可观看。</span></section>",
        "coverUrl": "",
        "pushedAt": "",
        "draftMediaId": ""
    },
    {
        "week": 2,
        "date": "2026-09-12",
        "title": "实盘周记｜第2周｜自建网站丨-535.7元，加息预期上升，该如何应对？",
        "essay": "1、账户情况：\n本周全球股市出现不同程度的回调，账户也回撤了-535.7元\n2、主要影响：\n美伊局势没有缓和的迹象，油价推升\n美国7月份PPI（生产者物价指数）超预期，CPI（消费者物价指数）符合预期\n通胀迟迟无法降低，市场对于美联储加息的概率大幅提升\n3、应对方式：\n一旦进入加息周期，未来至少一年，各国股市都面临着回调的压力，需要做好心理准备，保持计划定投。\n\n",
        "weeklyProfit": -535.7,
        "weeklyRate": null,
        "snapshot": {
            "totalAsset": 101825.35000000003,
            "totalMarket": 99497.35000000003,
            "totalCash": 2328,
            "totalProfit": 1997.4500000000003,
            "totalProfitRate": 0.020075409043557438,
            "bondPct": 62.1737317868291,
            "equityPct": 35.54000059906495,
            "targetCount": 21
        },
        "html": "<p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">大家好，这里是<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">叨居</strong>，欢迎来到我的投资纪实记录。</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">经过一段时间准备，我的个人记录网站「<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">投么有度</strong>」开启长期实盘更新。<br>从2026年开始，我计划用二十年时间，慢慢实践属于自己的退休积累计划。<br>投资对于我而言，永远只是生活的附属，<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">生活大于投资</strong>，也是我一直坚持的核心理念。</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">这是开始分享实盘周记的<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">第2周</strong>。</p><section style=\"display:inline-block;margin:30px 0 14px;padding:5px 14px;background:#f3ecdc;border-left:4px solid #c9a961;font-weight:700;font-size:16px;line-height:1.6;color:#7a5c28;\">本周账户概况（更新日期：2026-09-12）</section><section style=\"margin:14px 0 18px;padding:16px 12px;background:#f5faf5;border:1px solid #d8ecd8;border-radius:8px;text-align:center;\"><span style=\"font-size:13px;color:#7a6a45;\">本 周 收 益</span><br><strong style=\"font-size:24px;line-height:1.5;color:#0a7d48;\">¥ -535.70</strong></section><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">初始本金：<strong>¥ 100,000.00</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">总资产：<strong>¥ 101,825.35</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">组合总市值：<strong>¥ 99,497.35</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">现金：<strong>¥ 2,328.00</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">累计持仓收益：<strong style=\"color:#c00000;\">¥ +1,997.45</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">累计持仓收益率：<strong style=\"color:#c00000;\">+2.01%</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">当前资产配比：</p><section style=\"margin:6px 0;padding:10px 14px;background:#faf7f0;border-left:4px solid #c9a961;border-radius:4px;font-size:14px;line-height:1.8;color:#7a6a45;\">债券类占比：62.2%</section><section style=\"margin:6px 0;padding:10px 14px;background:#faf7f0;border-left:4px solid #c9a961;border-radius:4px;font-size:14px;line-height:1.8;color:#7a6a45;\">权益类占比：35.5%</section><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">现阶段处于<strong>积累期</strong>，我的配置思路以平衡收益与波动为主，采用偏稳健的股债搭配，不追求短期暴利，优先控制回撤，着眼几十年的长期复利。</p><section style=\"display:inline-block;margin:30px 0 14px;padding:5px 14px;background:#f3ecdc;border-left:4px solid #c9a961;font-weight:700;font-size:16px;line-height:1.6;color:#7a5c28;\">本周复盘</section><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">1、账户情况：</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">本周全球股市出现不同程度的回调，账户也回撤了-535.7元</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">2、主要影响：</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">美伊局势没有缓和的迹象，油价推升</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">美国7月份PPI（生产者物价指数）超预期，CPI（消费者物价指数）符合预期</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">通胀迟迟无法降低，市场对于美联储加息的概率大幅提升</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">3、应对方式：</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">一旦进入加息周期，未来至少一年，各国股市都面临着回调的压力，需要做好心理准备，保持计划定投。</p><section style=\"display:inline-block;margin:30px 0 14px;padding:5px 14px;background:#f3ecdc;border-left:4px solid #c9a961;font-weight:700;font-size:16px;line-height:1.6;color:#7a5c28;\">重要声明</section><section style=\"margin-top:30px;padding:14px 16px;background:#fafafa;border:1px solid #ececec;border-radius:6px;font-size:13px;line-height:1.8;color:#999;\">所有内容仅属于我个人的投资成长记录，不构成任何投资建议。市场有风险，入市需谨慎。</section><p style=\"margin:26px 0 0;font-size:13px;line-height:1.8;color:#999;\">更多长期投资思考与复盘笔记，会持续更新于此。</p><section style=\"margin:30px 0 0;padding:16px 18px;background:#faf7f0;border:1px solid #e8dfc8;border-radius:8px;text-align:center;font-size:14px;line-height:2.2;color:#7a6a45;\"><strong style=\"font-size:15px;\">每周更新实盘周记，欢迎关注</strong><br><span style=\"font-size:13px;\">公众号：叨居　|　B站：投么有度</span><br><span style=\"font-size:13px;color:#8a7a55;\">往后每周，我都会在这里同步账户最新情况，记录一路上的思考、犯错与成长。<br>完整的数据演示页面，可访问个人网站【投么有度】查看。<br>视频版本同步更新在B站，搜索「投么有度」即可观看。</span></section>",
        "coverUrl": "",
        "pushedAt": "",
        "draftMediaId": ""
    },
    {
        "week": 1,
        "date": "2026-09-05",
        "title": "实盘周记｜第1周｜自建网站丨10万本金退休投资记录",
        "essay": "实盘复盘周记丨第1周\n目前累计投入10万本金，正在摸索搭建一套适合自己的投资配置组合。\n近期目标：内部持仓标的的动态平衡\n本周只进行了一笔主动操作，卖出了小部分的偏债资产，增加现金额度，用于其他权益类资产的定投\n现阶段定投的标的：纳斯达克、标普500、红利低波和日股\n",
        "weeklyProfit": 79.73,
        "weeklyRate": null,
        "snapshot": {
            "totalAsset": 102360.57999999999,
            "totalMarket": 99216.07999999999,
            "totalCash": 3144.5,
            "totalProfit": 2533.19,
            "totalProfitRate": 0.02553205085304721,
            "bondPct": 61.91825993951969,
            "equityPct": 35.00975668563036,
            "targetCount": 18
        },
        "html": "<p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">大家好，这里是<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">叨居</strong>，欢迎来到我的投资纪实记录。</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">经过一段时间准备，我的个人记录网站「<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">投么有度</strong>」开启长期实盘更新。<br>从2026年开始，我计划用二十年时间，慢慢实践属于自己的退休积累计划。<br>投资对于我而言，永远只是生活的附属，<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">生活大于投资</strong>，也是我一直坚持的核心理念。</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">这是开始分享实盘周记的<strong style=\"color:#B8860B;background:#faf7f0;padding:1px 4px;border-radius:3px;\">第1周</strong>。</p><section style=\"display:inline-block;margin:30px 0 14px;padding:5px 14px;background:#f3ecdc;border-left:4px solid #c9a961;font-weight:700;font-size:16px;line-height:1.6;color:#7a5c28;\">本周账户概况（更新日期：2026-09-05）</section><section style=\"margin:14px 0 18px;padding:16px 12px;background:#fdf6f6;border:1px solid #f2d9d9;border-radius:8px;text-align:center;\"><span style=\"font-size:13px;color:#7a6a45;\">本 周 收 益</span><br><strong style=\"font-size:24px;line-height:1.5;color:#c00000;\">+¥ 79.73</strong></section><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">初始本金：<strong>¥ 100,000.00</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">总资产：<strong>¥ 102,360.58</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">组合总市值：<strong>¥ 99,216.08</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">现金：<strong>¥ 3,144.50</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">累计持仓收益：<strong style=\"color:#c00000;\">¥ +2,533.19</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">累计持仓收益率：<strong style=\"color:#c00000;\">+2.55%</strong></p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">当前资产配比：</p><section style=\"margin:6px 0;padding:10px 14px;background:#faf7f0;border-left:4px solid #c9a961;border-radius:4px;font-size:14px;line-height:1.8;color:#7a6a45;\">债券类占比：61.9%</section><section style=\"margin:6px 0;padding:10px 14px;background:#faf7f0;border-left:4px solid #c9a961;border-radius:4px;font-size:14px;line-height:1.8;color:#7a6a45;\">权益类占比：35.0%</section><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">现阶段处于<strong>积累期</strong>，我的配置思路以平衡收益与波动为主，采用偏稳健的股债搭配，不追求短期暴利，优先控制回撤，着眼几十年的长期复利。</p><section style=\"display:inline-block;margin:30px 0 14px;padding:5px 14px;background:#f3ecdc;border-left:4px solid #c9a961;font-weight:700;font-size:16px;line-height:1.6;color:#7a5c28;\">本周复盘</section><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">实盘复盘周记丨第1周</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">目前累计投入10万本金，正在摸索搭建一套适合自己的投资配置组合。</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">近期目标：内部持仓标的的动态平衡</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">本周只进行了一笔主动操作，卖出了小部分的偏债资产，增加现金额度，用于其他权益类资产的定投</p><p style=\"margin:0 0 14px;font-size:15px;line-height:1.9;color:#3f3f3f;letter-spacing:0.5px;\">现阶段定投的标的：纳斯达克、标普500、红利低波和日股</p><section style=\"display:inline-block;margin:30px 0 14px;padding:5px 14px;background:#f3ecdc;border-left:4px solid #c9a961;font-weight:700;font-size:16px;line-height:1.6;color:#7a5c28;\">重要声明</section><section style=\"margin-top:30px;padding:14px 16px;background:#fafafa;border:1px solid #ececec;border-radius:6px;font-size:13px;line-height:1.8;color:#999;\">所有内容仅属于我个人的投资成长记录，不构成任何投资建议。市场有风险，入市需谨慎。</section><p style=\"margin:26px 0 0;font-size:13px;line-height:1.8;color:#999;\">更多长期投资思考与复盘笔记，会持续更新于此。</p><section style=\"margin:30px 0 0;padding:16px 18px;background:#faf7f0;border:1px solid #e8dfc8;border-radius:8px;text-align:center;font-size:14px;line-height:2.2;color:#7a6a45;\"><strong style=\"font-size:15px;\">每周更新实盘周记，欢迎关注</strong><br><span style=\"font-size:13px;\">公众号：叨居　|　B站：投么有度</span><br><span style=\"font-size:13px;color:#8a7a55;\">往后每周，我都会在这里同步账户最新情况，记录一路上的思考、犯错与成长。<br>完整的数据演示页面，可访问个人网站【投么有度】查看；<br>视频版本同步更新在B站，搜索「投么有度」即可观看。</span></section>",
        "coverUrl": "",
        "pushedAt": "",
        "draftMediaId": ""
    }
];

/* ===== 公众号文章数据 ===== */
const ARTICLES = [
    {
        "date": "2026-10-02",
        "category": "每天认识一个指数",
        "title": "中证红利：专挑「愿意分钱的公司」",
        "summary": "中证红利：专挑「愿意分钱的公司」",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247484218&idx=1&sn=d9607c86ae34f914f5ec40f10d30b2a4&chksm=f529cb84c25e4292f4f068e9b437ce0e2131d3bcde9d0ad2de08adcc7257ba992f131af3bc8e&token=131387801&lang=zh_CN#rd"
    },
    {
        "date": "2026-09-30",
        "category": "每天认识一个指数",
        "title": "深证成指：A股资历最老的那批指数之一",
        "summary": "深证成指：A股资历最老的那批指数之一",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247484217&idx=1&sn=d8272adc55f2a37f332a7decc18c3d8d&chksm=f529cb87c25e4291bccd6e5af4ca77d851299f3556febc5297bae65d8c100bb4b2908b0454a0&token=131387801&lang=zh_CN#rd"
    },
    {
        "date": "2026-09-29",
        "category": "每天认识一个指数",
        "title": "创业板指：15 年换了三代主角的「成长班」",
        "summary": "创业板指：15 年换了三代主角的「成长班」",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247484216&idx=1&sn=6b70ff866c92d8380390d236b46f270b&chksm=f529cb86c25e4290b836e0a1a1dd29d4ceb9bddc6e16952af42b88b730bd24c2ed78782db0ad&token=131387801&lang=zh_CN#rd"
    },
    {
        "date": "2026-09-28",
        "category": "每天认识一个指数",
        "title": "科创100：从2146点到661点，这只指数四年半走完三种人生",
        "summary": "科创100：从2146点到661点，这只指数四年半走完三种人生",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247484215&idx=1&sn=f0bace7d4813a74fffc2c2d842df4b57&chksm=f529cb89c25e429fdcc8e9d8aec188fadda5a0f0263382476186ed0971c4a03c06c280690c9e&token=131387801&lang=zh_CN#rd"
    },
    {
        "date": "2026-09-24",
        "category": "每天认识一个指数",
        "title": "科创50：A 股脾气最暴的宽基",
        "summary": "科创50：A 股脾气最暴的宽基",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247484052&idx=1&sn=53fde115e73ea165f9af09d746768c77&chksm=f529ca2ac25e433ce37430d7322cffe3fa649b76086456db4324c3cc979d2cfadec662abd788&token=131387801&lang=zh_CN#rd"
    },
    {
        "date": "2026-09-23",
        "category": "每天认识一个指数",
        "title": "科创综指：五年半只涨 12%，随后一年涨 46%，科创综指经历了什么",
        "summary": "科创综指：五年半只涨 12%，随后一年涨 46%，科创综指经历了什么",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247484051&idx=1&sn=5094d103b6ac10ffa47ca1af32ba5950&chksm=f529ca2dc25e433b91b92cb403b78ed9c893bc07e8302840dd1b1cd1a1ffac651836cbf9ef45&token=131387801&lang=zh_CN#rd"
    },
    {
        "date": "2026-09-22",
        "category": "每天认识一个指数",
        "title": "上证50：上海滩最大的 50 家公司",
        "summary": "上证50：上海滩最大的 50 家公司",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247484050&idx=1&sn=0a54706b82193812b65eada6b47cdccd&chksm=f529ca2cc25e433a0e0a0e75c2cedac8f7d2875cde0c5017cea93d9c122f653228f2024595bd&token=131387801&lang=zh_CN#rd"
    },
    {
        "date": "2026-09-21",
        "category": "每天认识一个指数",
        "title": "上证指数：6124点，快19年了，A股还没回去过",
        "summary": "上证指数：6124点，快19年了，A股还没回去过",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247484049&idx=1&sn=c28deabb7abfc4b089189face9f22bc3&chksm=f529ca2fc25e43394fd3de07b4d33d733977c86cbde2acb753f9e3c30c1aaa8983c670940a22&token=131387801&lang=zh_CN#rd"
    },
    {
        "date": "2026-09-20",
        "category": "每天认识一个指数",
        "title": "中证1000：连跌三年亏掉58%的指数，凭什么被盯了十年",
        "summary": "中证1000：连跌三年亏掉58%的指数，凭什么被盯了十年",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247484048&idx=1&sn=5ccbc12fdb58cb02485c58c5e5e32f7d&chksm=f529ca2ec25e43389523fd17c0b5cc9341525e13b8df7c78cdd08bfb18a4202b0d8cf801b5eb&token=131387801&lang=zh_CN#rd"
    },
    {
        "date": "2026-09-18",
        "category": "每天认识一个指数",
        "title": "中证500：一篮子会自动换血的中盘公司",
        "summary": "中证500：一篮子会自动换血的中盘公司",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247483996&idx=1&sn=2325ddc946b33725a54085492fe83ec7&chksm=f529cae2c25e43f4368b0cd9862b73d97e7fbc276253cb59d8c76fb9e882164184cf7fd1a37d&token=131387801&lang=zh_CN#rd"
    },
    {
        "date": "2026-09-16",
        "category": "每天认识一个指数",
        "title": "中证A500：给每个行业分席位的500家公司",
        "summary": "中证A500：给每个行业分席位的500家公司",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247483931&idx=1&sn=fd3976bbd080b2603b00948b95eb593f&chksm=f529caa5c25e43b3b52b3a719bbf99ab0b29924e3bc3de404c127913e4cf1df1c49fffcf1693&token=131387801&lang=zh_CN#rd"
    },
    {
        "date": "2026-09-14",
        "category": "每天认识一个指数",
        "title": "沪深300：300 家公司，赚走 A 股 86% 的钱",
        "summary": "沪深300：300 家公司，赚走 A 股 86% 的钱",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247483918&idx=1&sn=bb472b024205d3979e20486db48a74fd&chksm=f529cab0c25e43a62854061c616d46646d81981e7c9165931064a8c4c5a667406a384fb130d7&token=131387801&lang=zh_CN#rd"
    },
    {
        "date": "2026-07-26",
        "category": "给大脑添砖加瓦",
        "title": "低利率时代，从忽视债券到补齐这堂必修课的心态转变",
        "summary": "随着近几年银行存款利率持续下行，叠加央行多轮降息为了刺激内需、释放市场流动性。在此低利率背景下，在今年年初布局投资时，个人并未考虑过配置债券品类。后来经历了几波市场的大起大落，逐渐意识到投资的核心目标不仅仅是赚取收益，控制最大回撤、平滑波动，对个人长期投资而言，才是当下优先级最高的投资优化。",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247483788&idx=1&sn=83e0876894ade9c80bb734c1af399f1c&chksm=f529c932c25e402436773ef018d0b2546a8303b76ed88f096e3ab32a8f8391f630afd4ddcfaa&token=293559108&lang=zh_CN#rd"
    },
    {
        "date": "2026-07-04",
        "category": "给大脑添砖加瓦",
        "title": "稳健投资者需关注的一个核心指标",
        "summary": "近期复盘学习过程中，发现大多数的普通投资者，投资过程中几乎都只盯着“收益率”作为选标的的核心指标，近期哪只标的的月收益率、年收益率高，无脑跟风买入。",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247483774&idx=1&sn=a7ceee7d7fd8582e81de507f8af04179&chksm=f529c9c0c25e40d6a15bebe1b032ccbba873c68e36075133941b6eca722697a78dc3a29277a5&token=293559108&lang=zh_CN#rd"
    },
    {
        "date": "2026-06-27",
        "category": "给大脑添砖加瓦",
        "title": "中证红利、红利低波50、红利低波100指数的核心区别",
        "summary": "那么关于中证红利、红利低波50与红利低波100这三者之间究竟有何区别？作为投资者应如何根据自身需求进行选择？",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247483771&idx=1&sn=c0afa140e5f7f4232e10cc1fd24d5bb4&chksm=f529c9c5c25e40d347e4a0a341b59cd5700465a4907148605e0a941dc76e3e984fef859c1ccd&token=293559108&lang=zh_CN#rd"
    },
    {
        "date": "2026-06-19",
        "category": "给大脑添砖加瓦",
        "title": "为什么隔夜美股大涨，你的纳指ETF反而不涨？",
        "summary": "有时候前一晚美股纳指明明大涨，第二天咱们A股的场内纳指ETF反而跌了；\n有时候昨晚美股纳指明明大跌，第二天场内纳指ETF反而翻红上涨；",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247483763&idx=1&sn=af59f7b30932dada156d469ef3bca705&chksm=f529c9cdc25e40db752cfd1398d04e353eb4d62f58856100cbec8292531d86e73ed6cb248d31&token=293559108&lang=zh_CN#rd"
    },
    {
        "date": "2026-06-14",
        "category": "给大脑添砖加瓦",
        "title": "你真的了解红利低波吗",
        "summary": "提到中证红利低波100指数，高分红低波动是其吸引人投资的核心要点，也是稳健投资者优先考虑的投资标的。",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247483748&idx=1&sn=b6fc8c5488eb242f2c5bc8703e17912c&chksm=f529c9dac25e40cc4c8eb6dbba296518c9e410f195a44c8140cf723a2f2263bfba8c347e6ea6&token=293559108&lang=zh_CN#rd"
    },
    {
        "date": "2026-06-13",
        "category": "给大脑添砖加瓦",
        "title": "SpaceX上市对纳斯达克100有何影响？",
        "summary": "史上最大IPO诞生——埃隆·马斯克把SpaceX送上纳斯达克，募资750亿美元、估值约1.77万亿美元。",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247483743&idx=1&sn=a1e5d183e3647e3ec24507f1489d2034&chksm=f529c9e1c25e40f741ea03e8bd634607f701ac46a79f6326a71c60785fc10c3c80a98dd63a59&token=293559108&lang=zh_CN#rd"
    },
    {
        "date": "2026-05-29",
        "category": "闲叙",
        "title": "今年世界杯的主题曲，你们听了吗",
        "summary": "每一届的世界杯主题曲，都会被人们拿来作为茶余饭后的谈资话题，因为往届有多首主题曲实在过于经典，所以难免不了拿出来让人比较。",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247483706&idx=1&sn=8ba03662621b36a43ea040f11b20cf00&chksm=f529c984c25e4092ae6682605b5ed268d96469a49087c19ebb46eac9691bb4e2522ba668fa76&token=293559108&lang=zh_CN#rd"
    },
    {
        "date": "2026-05-20",
        "category": "闲叙",
        "title": "对世界充满好奇的Deepseek",
        "summary": "2026年4 月 Deepseek V4 重磅发布，直接带火整个 AI 股市行情！",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247483693&idx=1&sn=0a0538459656fab86830114b4b61dfae&chksm=f529c993c25e40851e799eaa9f62f78083c620fc7722d11bfa810ab02fa55275a96ded7fde6a&token=293559108&lang=zh_CN#rd"
    },
    {
        "date": "2026-07-29",
        "category": "关于个人的投资觉醒",
        "title": "生活大于投资，持仓只是人生的边角配置",
        "summary": "从2026年开始，是开启正式投资之旅的第7个月，个人也从心态上慢慢完成了转变。期间也交了小白投资者必交的学费，身处牛市，学费照交，这在很多人看来很可笑。",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247483799&idx=1&sn=ae2d916aab1b696bf489f7739908d2d5&chksm=f529c929c25e403f722d0989dbc91bd50acf7dc7bb48012003e0d877d7c4076440f8163749c6&token=293559108&lang=zh_CN#rd"
    },
    {
        "date": "2026-06-01",
        "category": "关于个人的投资觉醒",
        "title": "投资入市半年时间，我做了一个决定",
        "summary": "投资小白入市近半年，我做出了一个决定：清仓掉了场内账户所有的持仓。",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247483714&idx=1&sn=43c8df249de1a1dc5b06bed73789f9c8&chksm=f529c9fcc25e40eaf5ca15812614fc47ccad38f133b167d24aa0c03dfd355da741fc7f04db81&token=293559108&lang=zh_CN#rd"
    },
    {
        "date": "2026-05-19",
        "category": "关于个人的投资觉醒",
        "title": "突然某一刻，我对投资顿悟了",
        "summary": "试问是在人生的哪个阶段，因何种缘由，才意识到了投资的重要性，并开始随之付诸行动，着手规划手中资产，慢慢摸索前行，最终实现财富稳步增值的呢？",
        "link": "https://mp.weixin.qq.com/s?__biz=MzcwOTMwNDc4NQ==&mid=2247483714&idx=1&sn=43c8df249de1a1dc5b06bed73789f9c8&chksm=f529c9fcc25e40eaf5ca15812614fc47ccad38f133b167d24aa0c03dfd355da741fc7f04db81&token=293559108&lang=zh_CN#rd"
    }
];

/* ===== 文章分类数据 ===== */
const CATEGORIES = [
    {
        "name": "关于个人的投资觉醒",
        "tagColor": "tag-blue",
        "desc": "意识到投资的重要性，纪录关于个人的投资心路历程"
    },
    {
        "name": "每天认识一个指数",
        "tagColor": "tag-cyan",
        "desc": ""
    },
    {
        "name": "给大脑添砖加瓦",
        "tagColor": "tag-green",
        "desc": "阅读与认知提升"
    },
    {
        "name": "闲叙",
        "tagColor": "tag-orange",
        "desc": "投资之外的生活随笔"
    }
];

/* ===== 分类图标（SVG） ===== */
const CATEGORY_ICONS = {
    "compass": "<svg viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><polygon points=\"16,8 13.5,13.5 8,16 10.5,10.5\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "book": "<svg viewBox=\"0 0 24 24\"><path d=\"M12 3L2 8l10 5 10-5-10-5z\"/><path d=\"M2 12l10 5 10-5\"/><path d=\"M2 16l10 5 10-5\"/></svg>",
    "chat": "<svg viewBox=\"0 0 24 24\"><path d=\"M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z\"/></svg>",
    "star": "<svg viewBox=\"0 0 24 24\"><polygon points=\"12,2 15,9 22,9.5 17,14.5 18.5,21.5 12,18 5.5,21.5 7,14.5 2,9.5 9,9\"/></svg>",
    "lightbulb": "<svg viewBox=\"0 0 24 24\"><path d=\"M9 18h6\"/><path d=\"M10 22h4\"/><path d=\"M15.09 14c.18-.3.41-.59.59-.86C16.64 12.19 17 11.12 17 10c0-2.76-2.24-5-5-5S7 7.24 7 10c0 1.12.36 2.19 1.41 3.14.18.27.41.56.59.86\"/></svg>",
    "chart": "<svg viewBox=\"0 0 24 24\"><path d=\"M3 3v18h18\"/><path d=\"M7 14l4-4 4 4 5-5\"/></svg>"
};

/* ===== 标签颜色选项 ===== */
const TAG_COLORS = [
    {
        "value": "tag-blue",
        "label": "蓝色"
    },
    {
        "value": "tag-green",
        "label": "绿色"
    },
    {
        "value": "tag-orange",
        "label": "橙色"
    },
    {
        "value": "tag-purple",
        "label": "紫色"
    },
    {
        "value": "tag-red",
        "label": "红色"
    },
    {
        "value": "tag-cyan",
        "label": "青色"
    },
    {
        "value": "tag-pink",
        "label": "粉色"
    },
    {
        "value": "tag-teal",
        "label": "蓝绿"
    },
    {
        "value": "tag-amber",
        "label": "琥珀"
    },
    {
        "value": "tag-indigo",
        "label": "靛蓝"
    },
    {
        "value": "tag-lime",
        "label": "青柠"
    },
    {
        "value": "tag-rose",
        "label": "玫瑰"
    }
];

/* ===== 数据源工具：以 data.js 数组为唯一数据源 ===== */
const Storage = {
    getHoldings() { return SAMPLE_HOLDINGS; },
    getTrades() { return SAMPLE_TRADES; },
    getArticles() { return ARTICLES; },
    addArticle(a) { ARTICLES.unshift(a); return ARTICLES; },
    deleteArticle(i) { if (i >= 0 && i < ARTICLES.length) ARTICLES.splice(i, 1); return ARTICLES; },
    updateArticle(i, a) { if (i >= 0 && i < ARTICLES.length) ARTICLES[i] = a; return ARTICLES; },
    getCategories() { return CATEGORIES; },
    addCategory(c) { CATEGORIES.push(c); return CATEGORIES; },
    updateCategory(old, c) { var i = CATEGORIES.findIndex(function(x) { return x.name === old; }); if (i >= 0) { CATEGORIES[i] = c; if (old !== c.name) ARTICLES.forEach(function(a) { if (a.category === old) a.category = c.name; }); } return CATEGORIES; },
    deleteCategory(n) { var i = CATEGORIES.findIndex(function(x) { return x.name === n; }); if (i >= 0) CATEGORIES.splice(i, 1); return CATEGORIES; },
    moveCategory(i, d) { var ni = i + d; if (ni < 0 || ni >= CATEGORIES.length) return CATEGORIES; var t = CATEGORIES[i]; CATEGORIES[i] = CATEGORIES[ni]; CATEGORIES[ni] = t; return CATEGORIES; },
    getInvTypes() { return INV_TYPES; },
    addInvType(n) { INV_TYPES.push(n); return INV_TYPES; },
    updateInvType(old, n) { var i = INV_TYPES.indexOf(old); if (i >= 0) { INV_TYPES[i] = n; INV_TARGETS.forEach(function(t) { if (t.type === old) t.type = n; }); } return INV_TYPES; },
    deleteInvType(n) { var i = INV_TYPES.indexOf(n); if (i >= 0) INV_TYPES.splice(i, 1); return INV_TYPES; },
    getInvCategories() { return INV_CATEGORIES; },
    getInvCategoryNotes() { return INV_CATEGORY_NOTES; },
    addInvCategory(n) { INV_CATEGORIES.push(n); return INV_CATEGORIES; },
    updateInvCategory(old, n) { var i = INV_CATEGORIES.indexOf(old); if (i >= 0) { INV_CATEGORIES[i] = n; INV_TARGETS.forEach(function(t) { if (t.category === old) t.category = n; }); } return INV_CATEGORIES; },
    deleteInvCategory(n) { var i = INV_CATEGORIES.indexOf(n); if (i >= 0) INV_CATEGORIES.splice(i, 1); return INV_CATEGORIES; },
    getHoldingsUpdate() { return HOLDINGS_UPDATE; },
    setHoldingsUpdate(x) { HOLDINGS_UPDATE.date = x.date; HOLDINGS_UPDATE.note = x.note || ''; return HOLDINGS_UPDATE; },
    getInvTargets() { return INV_TARGETS; },
    addInvTarget(t) { INV_TARGETS.push(t); return INV_TARGETS; },
    updateInvTarget(i, t) { if (i >= 0 && i < INV_TARGETS.length) INV_TARGETS[i] = t; return INV_TARGETS; },
    deleteInvTarget(i) { if (i >= 0 && i < INV_TARGETS.length) INV_TARGETS.splice(i, 1); return INV_TARGETS; },
    getCash() { return CASH; },
    addCash(x) { CASH.push(x); return CASH; },
    updateCash(i, x) { if (i >= 0 && i < CASH.length) CASH[i] = x; return CASH; },
    deleteCash(i) { if (i >= 0 && i < CASH.length) CASH.splice(i, 1); return CASH; },
    getAnnualReturns() { return ANNUAL_RETURNS; },
    addAnnualReturn(x) { ANNUAL_RETURNS.push(x); return ANNUAL_RETURNS; },
    updateAnnualReturn(i, x) { if (i >= 0 && i < ANNUAL_RETURNS.length) ANNUAL_RETURNS[i] = x; return ANNUAL_RETURNS; },
    deleteAnnualReturn(i) { if (i >= 0 && i < ANNUAL_RETURNS.length) ANNUAL_RETURNS.splice(i, 1); return ANNUAL_RETURNS; },
    getMonthlyReturns() { return MONTHLY_RETURNS; },
    addMonthlyReturn(x) { MONTHLY_RETURNS.push(x); return MONTHLY_RETURNS; },
    updateMonthlyReturn(i, x) { if (i >= 0 && i < MONTHLY_RETURNS.length) MONTHLY_RETURNS[i] = x; return MONTHLY_RETURNS; },
    deleteMonthlyReturn(i) { if (i >= 0 && i < MONTHLY_RETURNS.length) MONTHLY_RETURNS.splice(i, 1); return MONTHLY_RETURNS; },
    getClosedPositions() { return CLOSED_POSITIONS; },
    addClosedPosition(x) { CLOSED_POSITIONS.push(x); return CLOSED_POSITIONS; },
    updateClosedPosition(i, x) { if (i >= 0 && i < CLOSED_POSITIONS.length) CLOSED_POSITIONS[i] = x; return CLOSED_POSITIONS; },
    deleteClosedPosition(i) { if (i >= 0 && i < CLOSED_POSITIONS.length) CLOSED_POSITIONS.splice(i, 1); return CLOSED_POSITIONS; },
    getWeeklyConfig() { return WEEKLY_CONFIG; },
    setWeeklyConfig(x) { WEEKLY_CONFIG.startDate = x.startDate; WEEKLY_CONFIG.author = x.author || ''; return WEEKLY_CONFIG; },
    getWeeklyPosts() { return WEEKLY_POSTS; },
    addWeeklyPost(p) { WEEKLY_POSTS.unshift(p); return WEEKLY_POSTS; },
    updateWeeklyPost(i, p) { if (i >= 0 && i < WEEKLY_POSTS.length) WEEKLY_POSTS[i] = p; return WEEKLY_POSTS; },
    deleteWeeklyPost(i) { if (i >= 0 && i < WEEKLY_POSTS.length) WEEKLY_POSTS.splice(i, 1); return WEEKLY_POSTS; },
    resetData() {}
};