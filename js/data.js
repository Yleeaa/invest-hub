/* ===== 示例数据（实际使用时由后台录入） ===== */
const SAMPLE_HOLDINGS = [
    { id: 1, code: '510300', name: '沪深300ETF', market: 'A', type: '股票', shares: 10000, cost: 3.85, price: 4.12 },
    { id: 2, code: '510500', name: '中证500ETF', market: 'A', type: '股票', shares: 5000, cost: 5.20, price: 5.68 },
    { id: 3, code: '513500', name: '标普500ETF', market: '美', type: '股票', shares: 3000, cost: 1.85, price: 2.12 },
    { id: 4, code: '513100', name: '纳斯达克100ETF', market: '美', type: '股票', shares: 2000, cost: 2.50, price: 3.05 },
    { id: 5, code: '513880', name: '日经225ETF', market: '日', type: '股票', shares: 2000, cost: 1.45, price: 1.62 },
    { id: 6, code: '019547', name: '22国债05', market: 'A', type: '债券', shares: 100, cost: 100.50, price: 101.20 },
    { id: 7, code: '518880', name: '黄金ETF', market: 'A', type: '黄金', shares: 1000, cost: 4.20, price: 4.65 },
    { id: 8, code: 'CASH', name: '现金（人民币）', market: 'A', type: '现金', shares: 1, cost: 50000, price: 50000 },
];

/* ===== 交易记录示例 ===== */
const SAMPLE_TRADES = {
    '510300': [
        { date: '2024-03-15', type: '买入', price: 3.85, shares: 5000, reason: '市场调整，沪深300估值进入历史30%分位以下，分批建仓。' },
        { date: '2024-05-20', type: '买入', price: 3.75, shares: 5000, reason: '继续下跌，加仓摊低成本，长期看好大盘核心资产。' },
        { date: '2024-08-10', type: '买入', price: 3.90, shares: 2000, reason: '反弹初期，仓位不足小幅加仓。' },
    ],
    '513500': [
        { date: '2024-02-08', type: '买入', price: 1.92, shares: 1500, reason: '美股回调，标普500 PE回到合理区间，启动定投。' },
        { date: '2024-06-12', type: '买入', price: 1.78, shares: 1500, reason: '继续下跌，加大美股配置比例。' },
    ],
    '518880': [
        { date: '2024-04-22', type: '买入', price: 4.35, shares: 500, reason: '地缘风险升温，黄金避险价值凸显，配置5%对冲。' },
        { date: '2024-09-05', type: '买入', price: 4.10, shares: 500, reason: '降息预期加强，金价回调加仓。' },
    ],
    '019547': [
        { date: '2024-01-10', type: '买入', price: 100.50, shares: 100, reason: '锁定高利率，债券作为防御性资产配置。' },
    ]
};

/* ===== 收益历史数据（用于绘制曲线） ===== */
const SAMPLE_RETURNS = {
    week: [
        { date: '08-26', value: 100 },
        { date: '08-27', value: 100.3 },
        { date: '08-28', value: 99.8 },
        { date: '08-29', value: 100.1 },
        { date: '08-30', value: 100.6 },
        { date: '09-02', value: 100.9 },
        { date: '09-03', value: 101.2 },
    ],
    month: [
        { date: '08-05', value: 100 },
        { date: '08-12', value: 100.5 },
        { date: '08-19', value: 99.8 },
        { date: '08-26', value: 100.2 },
        { date: '09-02', value: 101.2 },
    ],
    year: [
        { date: '01月', value: 100 },
        { date: '02月', value: 102.5 },
        { date: '03月', value: 104.8 },
        { date: '04月', value: 103.2 },
        { date: '05月', value: 106.1 },
        { date: '06月', value: 108.5 },
        { date: '07月', value: 107.2 },
        { date: '08月', value: 109.8 },
        { date: '09月', value: 112.3 },
    ]
};

/* ===== 投资标的类型默认数据 ===== */
const SAMPLE_INV_TYPES = ['债券', '偏债', 'A股', '港股', '美股', '日股'];

/* ===== 投资标默认数据 ===== */
/* 字段：marketValue 当前市值、profit 收益、cost 持仓成本(=市值-收益) */
const SAMPLE_INV_TARGETS = [
    { type: '债券', code: '006792', name: '长城短债债券D', marketValue: 10008.21, profit: 8.21, cost: 10000.00, remark: '' },
    { type: '债券', code: '006791', name: '长城短债债券A', marketValue: 5001.40, profit: 1.40, cost: 5000.00, remark: '' },
    { type: '债券', code: '003102', name: '长盛盛裕纯债债券D', marketValue: 6006.85, profit: 6.85, cost: 6000.00, remark: '' },
    { type: '债券', code: '400030', name: '东方添益债券', marketValue: 5016.16, profit: 16.16, cost: 5000.00, remark: '' },
    { type: '债券', code: '007861', name: '鹏华丰享债券', marketValue: 5012.80, profit: 12.80, cost: 5000.00, remark: '' },

    { type: '偏债', code: '001837', name: '易方达瑞锦灵活配置混合A', marketValue: 10126.88, profit: 126.88, cost: 10000.00, remark: '' },
    { type: '偏债', code: '001838', name: '易方达瑞锦灵活配置混合C', marketValue: 24944.74, profit: -55.26, cost: 25000.00, remark: '' },

    { type: 'A股', code: '012861', name: '华泰柏瑞中证红利低波动ETF联接A', marketValue: 9924.71, profit: 2.57, cost: 9922.14, remark: '' },

    { type: '港股', code: '015204', name: '南方恒生科技ETF联接(QDII)C', marketValue: 2544.10, profit: -5.90, cost: 2550.00, remark: '' },

    { type: '美股', code: '513351', name: '摩根标普500指数(QDII)A', marketValue: 5543.01, profit: 443.01, cost: 5100.00, remark: '' },
    { type: '美股', code: '160140', name: '南方纳斯达克100指数(QDII)A', marketValue: 3517.42, profit: 247.42, cost: 3270.00, remark: '' },
    { type: '美股', code: '016055', name: '招商纳斯达克100ETF联接(QDII)A', marketValue: 4872.22, profit: 512.22, cost: 4360.00, remark: '' },
    { type: '美股', code: '017091', name: '景顺长城纳斯达克科技市值加权ETF联接(QDII)A', marketValue: 2638.68, profit: 578.68, cost: 2060.00, remark: '' },

    { type: '日股', code: '014808', name: '华安三菱日联日经225ETF联接(QDII)C', marketValue: 1271.83, profit: 101.83, cost: 1170.00, remark: '' },
    { type: '日股', code: '008280', name: '摩根日本精选股票(QDII)A', marketValue: 3076.48, profit: 183.98, cost: 2892.50, remark: '' }
];

/* ===== 现金示例数据 ===== */
/* 字段：name 名称、amount 金额、remark 备注 */
const SAMPLE_CASH = [
    { name: '招商银行活期', amount: 5000.00, remark: '日常备用金' },
    { name: '余额宝', amount: 3000.00, remark: '' }
];

/* ===== 公众号文章示例 ===== */
const SAMPLE_ARTICLES = [
    // 关于个人的投资觉醒
    { date: '2024-09-01', category: '投资觉醒', title: '退休规划的第一性原理：从现金流出发', summary: '退休不是攒够多少钱的问题，而是建立持续正向现金流的过程...', link: 'https://mp.weixin.qq.com/s/example1' },
    { date: '2024-08-15', category: '投资觉醒', title: '为什么我把50%仓位放在指数基金上', summary: '主动管理很难持续战胜市场，指数化是被验证过最可靠的投资方式...', link: 'https://mp.weixin.qq.com/s/example2' },
    { date: '2024-08-01', category: '投资觉醒', title: '市场暴跌时，我做了这三件事', summary: '当市场恐慌时，理性往往比聪明更重要。复盘最近一次调整中的操作...', link: 'https://mp.weixin.qq.com/s/example3' },
    { date: '2024-07-20', category: '投资觉醒', title: '全球资产配置的实战框架', summary: '从A、美、日、欧、港五个市场出发，构建一个均衡的全球组合...', link: 'https://mp.weixin.qq.com/s/example4' },
    { date: '2024-07-05', category: '投资觉醒', title: '我的投资检查清单（2024版）', summary: '一份每月/每季/每年需要检查的清单，帮助你保持纪律...', link: 'https://mp.weixin.qq.com/s/example5' },
    { date: '2024-06-18', category: '投资觉醒', title: '关于"长期持有"的一些误解', summary: '长期持有≠永远不卖，关键在于卖出的判断标准是什么...', link: 'https://mp.weixin.qq.com/s/example6' },

    // 给大脑添砖加瓦
    { date: '2024-09-10', category: '给大脑添砖加瓦', title: '《漫步华尔街》读书笔记：随机游走的智慧', summary: '市场短期是投票机，长期是称重机。这本书让我重新理解了有效市场...', link: 'https://mp.weixin.qq.com/s/example7' },
    { date: '2024-08-22', category: '给大脑添砖加瓦', title: '复利思维：理解世界第八大奇迹', summary: '爱因斯坦说复利是世界第八大奇迹，但真正理解它的人寥寥无几...', link: 'https://mp.weixin.qq.com/s/example8' },
    { date: '2024-07-28', category: '给大脑添砖加瓦', title: '概率论给投资者的三个启示', summary: '投资本质上是概率游戏，掌握概率思维能让你在不确定中找到确定性...', link: 'https://mp.weixin.qq.com/s/example9' },
    { date: '2024-06-30', category: '给大脑添砖加瓦', title: '读书笔记：《投资最重要的事》', summary: '霍华德·马克斯的逆向投资哲学，第二层思维是区分平庸与卓越的关键...', link: 'https://mp.weixin.qq.com/s/example10' },

    // 闲叙
    { date: '2024-09-15', category: '闲叙', title: '写在公众号一周年：感谢每一个你', summary: '从第一篇文章到今天，一年过去了。这条路比想象中更难，也更值得...', link: 'https://mp.weixin.qq.com/s/example11' },
    { date: '2024-08-28', category: '闲叙', title: '周末闲话：投资之外的生活美学', summary: '投资只是生活的一部分，周末的一杯咖啡、一本好书，才是真正的财富...', link: 'https://mp.weixin.qq.com/s/example12' },
    { date: '2024-07-12', category: '闲叙', title: '关于"自由"的一点碎碎念', summary: '财务自由不是终点，时间自由和心灵自由才是我们真正追求的东西...', link: 'https://mp.weixin.qq.com/s/example13' },
    { date: '2024-06-05', category: '闲叙', title: '一封写给未来自己的信', summary: '十年后的你，是否还记得今天许下的承诺？是否还走在正确的路上...', link: 'https://mp.weixin.qq.com/s/example14' },
];

/* ===== 文章分类默认数据 ===== */
const SAMPLE_CATEGORIES = [
    { name: '投资觉醒', tagColor: 'tag-blue', icon: 'compass', desc: '关于个人的投资觉醒' },
    { name: '给大脑添砖加瓦', tagColor: 'tag-green', icon: 'book', desc: '阅读与认知提升' },
    { name: '闲叙', tagColor: 'tag-orange', icon: 'chat', desc: '投资之外的生活随笔' },
];

/* ===== 分类图标（SVG） ===== */
const CATEGORY_ICONS = {
    compass: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><polygon points="16,8 13.5,13.5 8,16 10.5,10.5" fill="currentColor" stroke="none"/></svg>',
    book: '<svg viewBox="0 0 24 24"><path d="M12 3L2 8l10 5 10-5-10-5z"/><path d="M2 12l10 5 10-5"/><path d="M2 16l10 5 10-5"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg>',
    star: '<svg viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9.5 17,14.5 18.5,21.5 12,18 5.5,21.5 7,14.5 2,9.5 9,9"/></svg>',
    lightbulb: '<svg viewBox="0 0 24 24"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.3.41-.59.59-.86C16.64 12.19 17 11.12 17 10c0-2.76-2.24-5-5-5S7 7.24 7 10c0 1.12.36 2.19 1.41 3.14.18.27.41.56.59.86"/></svg>',
    chart: '<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>',
};

/* ===== 标签颜色选项 ===== */
const TAG_COLORS = [
    { value: 'tag-blue', label: '蓝色' },
    { value: 'tag-green', label: '绿色' },
    { value: 'tag-orange', label: '橙色' },
    { value: 'tag-purple', label: '紫色' },
    { value: 'tag-red', label: '红色' },
    { value: 'tag-cyan', label: '青色' },
];

/* ===== 本地存储工具 ===== */
const Storage = {
    KEY_HOLDINGS: 'pph_holdings',
    KEY_TRADES: 'pph_trades',
    KEY_ARTICLES: 'pph_articles',
    KEY_CATEGORIES: 'pph_categories',
    KEY_INV_TYPES: 'pph_inv_types',
    KEY_INV_TARGETS: 'pph_inv_targets',
    KEY_CASH: 'pph_cash',
    getHoldings() {
        const data = localStorage.getItem(this.KEY_HOLDINGS);
        return data ? JSON.parse(data) : SAMPLE_HOLDINGS;
    },
    setHoldings(list) {
        localStorage.setItem(this.KEY_HOLDINGS, JSON.stringify(list));
    },
    getTrades() {
        const data = localStorage.getItem(this.KEY_TRADES);
        return data ? JSON.parse(data) : SAMPLE_TRADES;
    },
    setTrades(obj) {
        localStorage.setItem(this.KEY_TRADES, JSON.stringify(obj));
    },
    getArticles() {
        const data = localStorage.getItem(this.KEY_ARTICLES);
        return data ? JSON.parse(data) : SAMPLE_ARTICLES;
    },
    setArticles(list) {
        localStorage.setItem(this.KEY_ARTICLES, JSON.stringify(list));
    },
    addArticle(article) {
        const list = this.getArticles();
        list.unshift(article);
        this.setArticles(list);
        return list;
    },
    deleteArticle(index) {
        const list = this.getArticles();
        list.splice(index, 1);
        this.setArticles(list);
        return list;
    },
    updateArticle(index, article) {
        const list = this.getArticles();
        if (index >= 0 && index < list.length) {
            list[index] = article;
            this.setArticles(list);
        }
        return list;
    },
    /* ===== 分类管理 ===== */
    getCategories() {
        const data = localStorage.getItem(this.KEY_CATEGORIES);
        return data ? JSON.parse(data) : JSON.parse(JSON.stringify(SAMPLE_CATEGORIES));
    },
    setCategories(list) {
        localStorage.setItem(this.KEY_CATEGORIES, JSON.stringify(list));
    },
    addCategory(cat) {
        const list = this.getCategories();
        list.push(cat);
        this.setCategories(list);
        return list;
    },
    updateCategory(oldName, cat) {
        const list = this.getCategories();
        const idx = list.findIndex(function(c) { return c.name === oldName; });
        if (idx >= 0) {
            list[idx] = cat;
            this.setCategories(list);
            // 同步更新文章中的分类名称
            if (oldName !== cat.name) {
                const articles = this.getArticles();
                let changed = false;
                articles.forEach(function(a) {
                    if (a.category === oldName) {
                        a.category = cat.name;
                        changed = true;
                    }
                });
                if (changed) this.setArticles(articles);
            }
        }
        return list;
    },
    deleteCategory(name) {
        const list = this.getCategories().filter(function(c) { return c.name !== name; });
        this.setCategories(list);
        return list;
    },
    /* ===== 投资标的类型管理 ===== */
    getInvTypes() {
        const data = localStorage.getItem(this.KEY_INV_TYPES);
        return data ? JSON.parse(data) : SAMPLE_INV_TYPES.slice();
    },
    setInvTypes(list) {
        localStorage.setItem(this.KEY_INV_TYPES, JSON.stringify(list));
    },
    addInvType(name) {
        const list = this.getInvTypes();
        list.push(name);
        this.setInvTypes(list);
        return list;
    },
    updateInvType(oldName, newName) {
        const list = this.getInvTypes();
        const idx = list.indexOf(oldName);
        if (idx >= 0) {
            list[idx] = newName;
            this.setInvTypes(list);
            // 同步更新投资标的中的类型
            const targets = this.getInvTargets();
            let changed = false;
            targets.forEach(function(t) {
                if (t.type === oldName) { t.type = newName; changed = true; }
            });
            if (changed) this.setInvTargets(targets);
        }
        return list;
    },
    deleteInvType(name) {
        const list = this.getInvTypes().filter(function(t) { return t !== name; });
        this.setInvTypes(list);
        return list;
    },
    /* ===== 投资标的管理 ===== */
    getInvTargets() {
        const data = localStorage.getItem(this.KEY_INV_TARGETS);
        return data ? JSON.parse(data) : JSON.parse(JSON.stringify(SAMPLE_INV_TARGETS));
    },
    setInvTargets(list) {
        localStorage.setItem(this.KEY_INV_TARGETS, JSON.stringify(list));
    },
    addInvTarget(target) {
        const list = this.getInvTargets();
        list.push(target);
        this.setInvTargets(list);
        return list;
    },
    updateInvTarget(index, target) {
        const list = this.getInvTargets();
        if (index >= 0 && index < list.length) {
            list[index] = target;
            this.setInvTargets(list);
        }
        return list;
    },
    deleteInvTarget(index) {
        const list = this.getInvTargets();
        list.splice(index, 1);
        this.setInvTargets(list);
        return list;
    },
    /* ===== 现金管理 ===== */
    getCash() {
        const data = localStorage.getItem(this.KEY_CASH);
        return data ? JSON.parse(data) : JSON.parse(JSON.stringify(SAMPLE_CASH));
    },
    setCash(list) {
        localStorage.setItem(this.KEY_CASH, JSON.stringify(list));
    },
    addCash(item) {
        const list = this.getCash();
        list.push(item);
        this.setCash(list);
        return list;
    },
    updateCash(index, item) {
        const list = this.getCash();
        if (index >= 0 && index < list.length) {
            list[index] = item;
            this.setCash(list);
        }
        return list;
    },
    deleteCash(index) {
        const list = this.getCash();
        list.splice(index, 1);
        this.setCash(list);
        return list;
    },
    resetData() {
        localStorage.removeItem(this.KEY_HOLDINGS);
        localStorage.removeItem(this.KEY_TRADES);
        localStorage.removeItem(this.KEY_CATEGORIES);
        localStorage.removeItem(this.KEY_INV_TYPES);
        localStorage.removeItem(this.KEY_INV_TARGETS);
        localStorage.removeItem(this.KEY_CASH);
    }
};

/* ===== 数据迁移：将旧分类名 '添砖加瓦' 统一为 '给大脑添砖加瓦' ===== */
(function migrateData() {
    var version = localStorage.getItem('pph_data_version') || '0';
    if (version < '1') {
        var articlesData = localStorage.getItem(Storage.KEY_ARTICLES);
        if (articlesData) {
            try {
                var articles = JSON.parse(articlesData);
                var changed = false;
                articles.forEach(function(a) {
                    if (a.category === '添砖加瓦') {
                        a.category = '给大脑添砖加瓦';
                        changed = true;
                    }
                });
                if (changed) {
                    localStorage.setItem(Storage.KEY_ARTICLES, JSON.stringify(articles));
                }
            } catch(e) {}
        }
        localStorage.setItem('pph_data_version', '1');
    }
})();
