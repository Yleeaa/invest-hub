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

    renderStats();
    renderCharts();
    renderDetail();
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
        totalProfitRate: totalMarket > 0 ? totalProfit / totalMarket : 0,
        count: list.length,
        markets,
        types
    };
}

/* ===== 统计指标 ===== */
function renderStats() {
    const list = getDisplayList();
    const m = calcInvMetrics(list);

    // 债券类（债券 + 偏债）与 权益类（A股/港股/美股/日股）占总资产百分比
    let bondTotal = 0, equityTotal = 0;
    list.forEach(item => {
        if (item.type === '债券' || item.type === '偏债') bondTotal += item.marketValue;
        else if (['A股', '港股', '美股', '日股'].indexOf(item.type) !== -1) equityTotal += item.marketValue;
    });
    const bondPct = m.totalAsset > 0 ? (bondTotal / m.totalAsset * 100) : 0;
    const equityPct = m.totalAsset > 0 ? (equityTotal / m.totalAsset * 100) : 0;

    const cards = [
        { label: '总资产', value: '¥ ' + fmtMoney(m.totalAsset), sub: '市值 + 现金' },
        { label: '总市值', value: '¥ ' + fmtMoney(m.totalMarket), sub: '' },
        { label: '现金', value: '¥ ' + fmtMoney(m.totalCash), sub: m.totalAsset > 0 ? '占比 ' + (m.totalCash / m.totalAsset * 100).toFixed(1) + '%' : '' },
        {
            label: '债券类占比',
            value: bondPct.toFixed(1) + '%',
            sub: '债券整体（含偏债）/ 总资产',
        },
        {
            label: '权益类占比',
            value: equityPct.toFixed(1) + '%',
            sub: '股票类整体 / 总资产',
        },
    ];

    const grid = document.getElementById('statGrid');
    grid.innerHTML = cards.map(c => `
        <div class="stat-card">
            <div class="label">${c.label}</div>
            <div class="value ${c.color === 'success' ? 'text-success' : c.color === 'danger' ? 'text-danger' : ''}">${c.value}</div>
            ${c.sub ? `<div class="sub">${c.sub}</div>` : ''}
        </div>
    `).join('');
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
        if (!catMap[c]) catMap[c] = { name: c, marketValue: 0, profit: 0, count: 0 };
        catMap[c].marketValue += d.marketValue;
        catMap[c].profit += d.profit;
        catMap[c].count += 1;
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

    const tbody = document.querySelector('#detailTable tbody');
    if (aggregated.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted" style="text-align:center; padding: 2rem;">暂无投资标的，请到 <a href="admin.html" target="_blank" style="color: var(--h-gold);">管理后台</a> 录入</td></tr>';
    } else {
        tbody.innerHTML = aggregated.map(d => {
            const weight = m.totalMarket > 0 ? d.marketValue / m.totalMarket : 0;
            const color = categoryColor(d.name);
            // 收益率 = 该分类总收益 / 该分类总市值
            const rate = d.marketValue > 0 ? d.profit / d.marketValue : 0;
            const rateColor = d.profit >= 0 ? 'var(--up)' : 'var(--down)';
            const rateText = (rate >= 0 ? '+' : '') + (rate * 100).toFixed(2) + '%';
            return `
            <tr>
                <td><span class="badge" style="background:${color}22;color:${color};">${d.name}</span></td>
                <td style="text-align:right;">¥ ${fmtMoney(d.marketValue)}</td>
                <td style="text-align:right; color:${rateColor}; font-weight:600;">${rateText}</td>
                <td>
                    <div class="weight-bar" title="${(weight * 100).toFixed(2)}%">
                        <span style="width:${(weight * 100).toFixed(2)}%"></span>
                    </div>
                    <div class="text-muted" style="font-size: 0.75rem; margin-top: 4px;">${(weight * 100).toFixed(2)}%</div>
                </td>
            </tr>`;
        }).join('');
    }

    document.getElementById('detailSummary').textContent =
        '总市值 ¥ ' + fmtMoney(m.totalMarket) + ' · 现金 ¥ ' + fmtMoney(m.totalCash) + ' · 总资产 ¥ ' + fmtMoney(m.totalAsset) + ' · 持仓收益 ' + (m.totalProfit >= 0 ? '+' : '') + fmtMoney(m.totalProfit) + '（' + (m.totalProfitRate >= 0 ? '+' : '') + (m.totalProfitRate * 100).toFixed(2) + '%）';
}

/* ===== 增删改（前端不再提供，引导到后台） ===== */
function openAddModal() {
    openModal('holdingModal');
}

function refreshAll() {
    renderStats();
    if (typeChart) typeChart.destroy();
    if (marketChart) marketChart.destroy();
    renderCharts();
    renderDetail();
}
