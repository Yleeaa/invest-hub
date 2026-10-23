/* ===== 持仓页面逻辑 ===== */
let typeChart, marketChart;

document.addEventListener('DOMContentLoaded', () => {
    // Tab 切换
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.tab;
            document.getElementById('tab-' + target).classList.add('active');
        });
    });

    renderCharts();
    renderDetail();
    renderDrawdown();

    // 回本数学对照弹窗
    const ddRefModal = document.getElementById('ddRefModal');
    if (ddRefModal) {
        document.getElementById('ddRefBtn').addEventListener('click', () => ddRefModal.classList.add('open'));
        ddRefModal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => ddRefModal.classList.remove('open')));
        document.addEventListener('keydown', e => { if (e.key === 'Escape') ddRefModal.classList.remove('open'); });
    }
});

/* ===== 数据源：基于新的投资标的（inv_targets） ===== */
function typeToMarket(typeName) {
    // 把中文类型映射到市场维度（用于市场分布图）
    if (typeName === '港股') return '港';
    if (typeName === '美股') return '美';
    if (typeName === '日股') return '日';
    return 'A'; // 债券 / 偏债 / A股 都归为 A 股
}

function getDisplayList() {
    // 从新数据源读取并转换为统一格式
    const list = Storage.getInvTargets();
    const typeOrder = Storage.getInvTypes();
    // 按类型排序
    list.sort((a, b) => {
        let idxA = typeOrder.indexOf(a.type);
        let idxB = typeOrder.indexOf(b.type);
        if (idxA === -1) idxA = 999;
        if (idxB === -1) idxB = 999;
        return idxA - idxB;
    });
    return list.map((t, i) => {
        const marketValue = parseFloat(t.marketValue) || 0;
        const profit = parseFloat(t.profit) || 0;
        const cost = parseFloat(t.cost) || (marketValue - profit);
        return {
            id: i + 1,
            code: t.code || '',
            name: t.name || '',
            type: t.type || '—',
            category: t.category || '未分类',
            market: typeToMarket(t.type),
            remark: t.remark || '',
            marketValue: marketValue,
            profit: profit,
            cost: cost,
            profitRate: marketValue > 0 ? profit / marketValue : 0
        };
    });
}

function calcInvMetrics(list) {
    let totalMarket = 0, totalProfit = 0, totalCost = 0;
    const markets = {};
    const types = {};
    list.forEach(item => {
        totalMarket += item.marketValue;
        totalProfit += item.profit;
        totalCost += item.cost;
        markets[item.market] = (markets[item.market] || 0) + item.marketValue;
        types[item.type] = (types[item.type] || 0) + item.marketValue;
    });
    // 占比（按当前市值占比）
    list.forEach(item => {
        item.weight = totalMarket > 0 ? item.marketValue / totalMarket : 0;
    });
    // 现金
    const cashList = Storage.getCash();
    const totalCash = cashList.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
    return {
        totalMarket,
        totalProfit,
        totalCost,
        totalCash,
        totalAsset: totalMarket + totalCash,
        totalProfitRate: totalCost > 0 ? totalProfit / totalCost : 0,
        count: list.length,
        markets,
        types
    };
}

/* ===== 图表 ===== */
function renderCharts() {
    const list = getDisplayList();
    const m = calcInvMetrics(list);

    // 类型分布（环形图，按当前市值）
    const typeLabels = Object.keys(m.types);
    const typeValues = typeLabels.map(k => m.types[k]);
    const ctx2 = document.getElementById('typeChart').getContext('2d');
    typeChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: typeLabels,
            datasets: [{
                data: typeValues
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            // 类型分布：当前金额 / 总市值
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                            return ' ' + pct + '%  ·  ¥ ' + fmtMoney(ctx.parsed);
                        }
                    }
                }
            },
            cutout: '62%'
        }
    });
    buildCustomLegend('typeLegend', typeChart);

    // 总仓位合计（各类型金额之和 = 总市值，占 总资产 的比例）
    const typeTotalEl = document.getElementById('typeTotal');
    if (typeTotalEl) {
        const sum = typeValues.reduce((a, b) => a + b, 0);
        const pct = m.totalAsset > 0 ? (sum / m.totalAsset * 100).toFixed(1) : '0.0';
        typeTotalEl.innerHTML = '<span>总仓位（各类型合计）</span><span><b>' + pct + '%</b> · ¥ ' + fmtMoney(sum) + '</span>';
    }

    // 市场分布（环形图，与类型分布风格统一）
    const marketLabels = Object.keys(m.markets);
    const marketValues = marketLabels.map(k => m.markets[k]);
    const ctx3 = document.getElementById('marketChart').getContext('2d');
    marketChart = new Chart(ctx3, {
        type: 'doughnut',
        data: {
            labels: marketLabels,
            datasets: [{
                data: marketValues
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                            return ' ' + pct + '%  ·  ¥ ' + fmtMoney(ctx.parsed);
                        }
                    }
                }
            },
            cutout: '62%'
        }
    });
    buildCustomLegend('marketLegend', marketChart);
}

/* ===== 自定义 HTML 图例（直接显示比例） ===== */
function buildCustomLegend(elId, chart) {
    const el = document.getElementById(elId);
    if (!el) return;
    const ds = chart.data.datasets[0];
    const labels = chart.data.labels;
    const values = ds.data;
    const colors = ds._baseColors || ds.backgroundColor;
    const total = values.reduce((a, b) => a + b, 0);

    el.innerHTML = labels.map((label, i) => {
        const val = values[i];
        const pct = total > 0 ? (val / total * 100).toFixed(1) : '0.0';
        const color = Array.isArray(colors) ? colors[i] : colors;
        return `<div class="legend-item">
            <span class="legend-dot" style="background:${color};color:${color};"></span>
            <span class="legend-label">${label}</span>
            <span class="legend-pct">${pct}%</span>
        </div>`;
    }).join('');
}

/* ===== 类型颜色映射（与图表调色板一致） ===== */
const TYPE_COLOR_MAP = {
    'A股': '#6b9eff',
    '港股': '#f09696',
    '美股': '#c9a961',
    '日股': '#6fd9a0',
    '债券': '#a995f5',
    '偏债': '#fbc94d',
    '黄金': '#5dd9e8',
    '现金': '#a0aec0'
};
function typeColor(type) {
    return TYPE_COLOR_MAP[type] || '#94a3b8';
}

/* ===== 分类颜色映射（按 INV_CATEGORIES 顺序循环取色） ===== */
const CATEGORY_PALETTE = ['#c9a961', '#6b9eff', '#f09696', '#6fd9a0', '#a995f5', '#fbc94d', '#5dd9e8', '#a0aec0'];
function categoryColor(name) {
    const cats = (typeof Storage !== 'undefined' && Storage.getInvCategories) ? Storage.getInvCategories() : [];
    let idx = cats.indexOf(name);
    if (idx < 0) idx = 0;
    return CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length];
}

/* ===== 持仓明细表（按分类聚合） ===== */
function renderDetail() {
    const list = getDisplayList();
    const m = calcInvMetrics(list);

    // 按 category 聚合
    const catMap = {};
    list.forEach(d => {
        const c = d.category || '未分类';
        if (!catMap[c]) catMap[c] = { name: c, marketValue: 0, cost: 0, profit: 0 };
        catMap[c].marketValue += d.marketValue;
        catMap[c].cost += d.cost;
        catMap[c].profit += d.profit;
    });

    // 按 INV_CATEGORIES 配置顺序排序
    const cats = (typeof Storage !== 'undefined' && Storage.getInvCategories) ? Storage.getInvCategories() : [];
    const aggregated = Object.values(catMap).sort((a, b) => {
        let ia = cats.indexOf(a.name);
        let ib = cats.indexOf(b.name);
        if (ia === -1) ia = 999;
        if (ib === -1) ib = 999;
        return ia - ib;
    });

    // 分类备注（数据源：后台「投资分类」的备注）
    const catNotes = (typeof Storage !== 'undefined' && Storage.getInvCategoryNotes) ? (Storage.getInvCategoryNotes() || {}) : {};

    const tbody = document.querySelector('#detailTable tbody');
    if (aggregated.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-muted" style="text-align:center; padding: 2rem;">暂无投资标的，请到 <a href="admin.html" target="_blank" style="color: var(--h-gold);">管理后台</a> 录入</td></tr>';
    } else {
        tbody.innerHTML = aggregated.map(d => {
            // 占比 = 该分类总市值 / 总资产（总资产 = 总市值 + 现金）
            const weight = m.totalAsset > 0 ? d.marketValue / m.totalAsset : 0;
            const color = categoryColor(d.name);
            // 收益率 = 该分类总收益 / 该分类总成本（与回撤提醒口径一致）
            const rate = d.cost > 0 ? d.profit / d.cost : 0;
            const rateColor = d.profit >= 0 ? 'var(--up)' : 'var(--down)';
            const rateText = (rate >= 0 ? '+' : '') + (rate * 100).toFixed(2) + '%';
            return `
            <tr>
                <td><span class="badge" style="background:${color}22;color:${color};">${d.name}</span></td>
                <td data-label="仓位">
                    <div class="weight-bar" title="${(weight * 100).toFixed(2)}%">
                        <span style="width:${(weight * 100).toFixed(2)}%"></span>
                    </div>
                    <div class="text-muted" style="font-size: 0.75rem; margin-top: 4px;">${(weight * 100).toFixed(2)}%</div>
                </td>
                <td data-label="总市值" style="text-align:right;">¥ ${fmtMoney(d.marketValue)}</td>
                <td data-label="收益率" style="text-align:right; color:${rateColor}; font-weight:600;">${rateText}</td>
                <td data-label="备注" class="col-note text-muted" style="font-size: 0.78rem;">${catNotes[d.name] || '—'}</td>
            </tr>`;
        }).join('');
    }

    // 合计行：各分类市值与占比之和（占比以总资产为分母）
    const foot = document.getElementById('detailFoot');
    if (foot) {
        const sumMarket = aggregated.reduce((s, d) => s + d.marketValue, 0);
        const sumWeight = m.totalAsset > 0 ? sumMarket / m.totalAsset : 0;
        foot.innerHTML = aggregated.length === 0 ? '' : `
            <tr>
                <td>合计</td>
                <td data-label="占比"><div class="text-muted" style="font-size: 0.75rem;">${(sumWeight * 100).toFixed(2)}%</div></td>
                <td data-label="总市值" style="text-align:right;">¥ ${fmtMoney(sumMarket)}</td>
                <td></td>
                <td></td>
            </tr>`;
    }

    // 顶部摘要：各指标分色展示，便于浏览
    const sumEl = document.getElementById('detailSummary');
    if (sumEl) {
        const up = m.totalProfit >= 0;
        sumEl.innerHTML =
            '<span class="sum-item"><i>总市值</i><b class="v-market">¥ ' + fmtMoney(m.totalMarket) + '</b></span>' +
            '<span class="sum-item"><i>现金</i><b class="v-cash">¥ ' + fmtMoney(m.totalCash) + '</b></span>' +
            '<span class="sum-item"><i>总资产</i><b class="v-asset">¥ ' + fmtMoney(m.totalAsset) + '</b></span>' +
            '<span class="sum-item"><i>持仓收益</i><b style="color: ' + (up ? 'var(--up)' : 'var(--down)') + ';">' +
            (up ? '+' : '') + fmtMoney(m.totalProfit) + '（' + (up ? '+' : '') + (m.totalProfitRate * 100).toFixed(2) + '%）</b></span>';
    }

    renderClosedRecords();
}

/* ===== 清仓记录（数据源：后台「清仓分析」的已清仓标的） ===== */
function renderClosedRecords() {
    const tbody = document.querySelector('#closedTable tbody');
    if (!tbody) return;

    const list = (typeof Storage !== 'undefined' && Storage.getClosedPositions) ? (Storage.getClosedPositions() || []) : [];

    // 按清仓日期倒序（同日期按录入顺序倒序）
    const sorted = list.map((item, idx) => ({ item, idx })).sort((a, b) => {
        const da = (a.item.closeDate || '').toString();
        const db = (b.item.closeDate || '').toString();
        if (da === db) return b.idx - a.idx;
        return db.localeCompare(da);
    });

    if (sorted.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-muted" style="text-align:center; padding: 1.5rem;">暂无清仓记录</td></tr>';
        return;
    }

    tbody.innerHTML = sorted.map(({ item }) => {
        const cost = parseFloat(item.cost) || 0;
        const profit = (item.profit !== undefined && item.profit !== null && item.profit !== '')
            ? parseFloat(item.profit)
            : (parseFloat(item.soldValue) || 0) - cost;
        // 收益率 = 收益 / 本金（本金即持仓成本）
        const rate = cost !== 0 ? profit / cost : 0;
        const color = profit >= 0 ? 'var(--up)' : 'var(--down)';
        const rateText = (rate >= 0 ? '+' : '') + (rate * 100).toFixed(2) + '%';
        const dateText = (item.closeDate || '').toString().slice(0, 7) || '—';
        return `
            <tr>
                <td>${item.name || '—'}</td>
                <td data-label="收益率" style="text-align:right; color:${color}; font-weight:600;">${rateText}</td>
                <td data-label="清仓日期" style="text-align:right; color:var(--h-text-3);">${dateText}</td>
            </tr>`;
    }).join('');
}

/* ===== 增删改（前端不再提供，引导到后台） ===== */
function openAddModal() {
    openModal('holdingModal');
}

function refreshAll() {
    if (typeChart) typeChart.destroy();
    if (marketChart) marketChart.destroy();
    renderCharts();
    renderDetail();
    renderDrawdown();
}

/* ===== 回撤提醒 ===== */
function ddEsc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function ddMoney(n) {
    const sign = n < 0 ? '-' : '';
    return sign + '¥ ' + Math.abs(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function ddPct(x) {
    return (x >= 0 ? '+' : '') + (x * 100).toFixed(2) + '%';
}

function renderDrawdown() {
    const box = document.getElementById('ddPadList');
    if (!box) return;
    const list = getDisplayList();

    /* 与持仓明细一致：按分类（category）聚合 */
    const catMap = {};
    list.forEach(p => {
        const c = p.category || '未分类';
        if (!catMap[c]) catMap[c] = { name: c, cost: 0, marketValue: 0, profit: 0, count: 0 };
        catMap[c].cost += p.cost;
        catMap[c].marketValue += p.marketValue;
        catMap[c].profit += p.profit;
        catMap[c].count += 1;
    });
    const cats = Object.values(catMap);

    /* 整体状态 */
    let totalCost = 0, totalMarket = 0, totalProfit = 0, lossCount = 0;
    cats.forEach(p => {
        totalCost += p.cost;
        totalMarket += p.marketValue;
        totalProfit += p.profit;
        if (p.profit < 0) lossCount++;
    });
    document.getElementById('ddTotalCost').textContent = ddMoney(totalCost);
    document.getElementById('ddTotalMarket').textContent = ddMoney(totalMarket);
    const lossEl = document.getElementById('ddLossCount');
    lossEl.textContent = lossCount + ' 个';
    lossEl.classList.toggle('loss-num', lossCount > 0);

    const keyLabel = document.getElementById('ddKeyLabel');
    const keyValue = document.getElementById('ddKeyValue');
    const keyNote = document.getElementById('ddKeyNote');
    if (!cats.length || totalMarket <= 0) {
        keyLabel.textContent = '整体状态';
        keyValue.textContent = '—';
        keyNote.textContent = '暂无持仓数据';
    } else if (totalProfit >= 0) {
        keyLabel.textContent = '整体安全垫';
        keyValue.textContent = '−' + (totalProfit / totalMarket * 100).toFixed(2) + '%';
        keyNote.textContent = '整体还可承受的回撤幅度';
    } else {
        keyLabel.textContent = '整体距回本';
        keyValue.textContent = '+' + (-totalProfit / totalMarket * 100).toFixed(2) + '%';
        keyNote.textContent = '整体回本所需的上涨幅度';
    }

    /* 回撤预警：浮亏标的，亏得最狠的在前 */
    const alertBox = document.getElementById('ddAlertList');
    const losses = cats.filter(p => p.profit < 0)
        .sort((a, b) => (a.profit / (a.cost || 1)) - (b.profit / (b.cost || 1)));
    if (!losses.length) {
        alertBox.innerHTML = '<div class="dd-all-clear"><span class="dot"></span>当前无浮亏持仓，所有标的均在成本线上方</div>';
    } else {
        alertBox.innerHTML = losses.map(p => {
            const gain = -p.profit / (p.marketValue || 1); /* 距回本需涨（按市值） */
            const progress = Math.min((p.marketValue / (p.cost || 1)) * 100, 100);
            return `
            <div class="dd-alert-card">
                <div class="dd-alert-head">
                    <div class="dd-name"><span class="badge" style="background:${categoryColor(p.name)}22;color:${categoryColor(p.name)};">${ddEsc(p.name)}</span></div>
                    <div class="dd-loss-val">浮亏 ${ddMoney(p.profit)}（${ddPct(p.profit / (p.cost || 1))}）</div>
                </div>
                <div class="dd-alert-body">
                    <div class="dd-recover"><span class="lbl">距回本需涨</span><span class="val">+${(gain * 100).toFixed(2)}%</span></div>
                    <div class="dd-progress">
                        <div class="dd-progress-meta"><span>回本进度 ${progress.toFixed(1)}%</span><span>成本线 ${ddMoney(p.cost)}</span></div>
                        <div class="dd-track"><div class="dd-fill" style="width:${progress.toFixed(1)}%"></div></div>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    /* 持仓安全垫：离成本线越近排越前 */
    if (!cats.length) {
        box.innerHTML = '<div class="dd-pad-row" style="text-align:center;color:var(--h-text-3);">暂无投资标的，请到管理后台录入</div>';
    } else {
        box.innerHTML = cats.slice()
            .sort((a, b) => (a.profit / (a.marketValue || 1)) - (b.profit / (b.marketValue || 1)))
            .map(p => {
                const isLoss = p.profit < 0;
                const pad = p.profit / (p.marketValue || 1); /* 安全垫（按市值） */
                const padStat = isLoss
                    ? `<span class="val gold">需涨 +${(-p.profit / (p.marketValue || 1) * 100).toFixed(2)}%</span>`
                    : `<span class="val gold">可跌 −${(pad * 100).toFixed(2)}%</span>`;
                /* 厚度条：从成本线起量，满格 = 10% */
                const scalePct = Math.min(Math.abs(pad) / 0.1 * 100, 100);
                const bar = `<div class="dd-pad-bar"><span class="bar-lbl">成本线</span><div class="dd-pad-track"><div class="dd-pad-fill${isLoss ? ' loss-fill' : ''}" style="width:${scalePct.toFixed(1)}%"></div></div><span class="bar-lbl">10%</span></div>`;
                return `
                <div class="dd-pad-row">
                    <div class="dd-pad-main">
                        <div class="dd-name"><span class="badge" style="background:${categoryColor(p.name)}22;color:${categoryColor(p.name)};">${ddEsc(p.name)}</span></div>
                        <div class="dd-pad-stats">
                            <div class="dd-pad-stat"><span class="lbl">盈亏</span><span class="val ${isLoss ? 'down' : 'up'}">${ddMoney(p.profit)}</span></div>
                            <div class="dd-pad-stat"><span class="lbl">收益率</span><span class="val ${isLoss ? 'down' : 'up'}">${ddPct(p.profit / (p.cost || 1))}</span></div>
                            <div class="dd-pad-stat"><span class="lbl">${isLoss ? '距回本' : '安全垫'}</span>${padStat}</div>
                        </div>
                    </div>
                    ${bar}
                </div>`;
            }).join('');
    }

    /* 回本数学对照：亏损→回本涨幅；盈利→可跌回成本幅度 */
    const steps = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50];
    document.getElementById('ddRefLoss').innerHTML = steps.map(l => {
        const g = l / (1 - l);
        return `<div class="dd-ref-item"><div class="dd-ref-lbl">亏 ${(l * 100).toFixed(0)}%</div><div class="dd-ref-val">需涨 +${(g * 100).toFixed(1)}%</div></div>`;
    }).join('');
    document.getElementById('ddRefGain').innerHTML = steps.map(pf => {
        const d = pf / (1 + pf);
        return `<div class="dd-ref-item"><div class="dd-ref-lbl">盈 ${(pf * 100).toFixed(0)}%</div><div class="dd-ref-val">可跌 −${(d * 100).toFixed(1)}%</div></div>`;
    }).join('');
}
