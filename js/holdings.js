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
    return list.map((t, i) => {
        const marketValue = parseFloat(t.marketValue) || 0;
        const profit = parseFloat(t.profit) || 0;
        const cost = parseFloat(t.cost) || (marketValue - profit);
        return {
            id: i + 1,
            code: t.code || '',
            name: t.name || '',
            type: t.type || '—',
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

    const cards = [
        { label: '总资产', value: '¥ ' + fmtMoney(m.totalAsset), sub: '市值 + 现金' },
        { label: '总市值', value: '¥ ' + fmtMoney(m.totalMarket), sub: '' },
        { label: '现金', value: '¥ ' + fmtMoney(m.totalCash), sub: m.totalAsset > 0 ? '占比 ' + (m.totalCash / m.totalAsset * 100).toFixed(1) + '%' : '' },
        {
            label: '累计收益',
            value: (m.totalProfit >= 0 ? '+' : '') + '¥ ' + fmtMoney(m.totalProfit),
            sub: '',
            color: m.totalProfit >= 0 ? 'success' : 'danger'
        },
        {
            label: '总收益率',
            value: (m.totalProfitRate >= 0 ? '+' : '') + fmtPercent(m.totalProfitRate),
            sub: '收益 / 当前市值',
            color: m.totalProfitRate >= 0 ? 'success' : 'danger'
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

/* ===== 持仓明细表 ===== */
function renderDetail() {
    const list = getDisplayList();
    const m = calcInvMetrics(list);

    const tbody = document.querySelector('#detailTable tbody');
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-muted" style="text-align:center; padding: 2rem;">暂无投资标的，请到 <a href="admin.html" target="_blank" style="color: var(--h-gold);">管理后台</a> 录入</td></tr>';
    } else {
        tbody.innerHTML = list.map((d, idx) => {
            const color = typeColor(d.type);
            return `
            <tr>
                <td><span class="badge" style="background:${color}22;color:${color};">${d.type}</span></td>
                <td style="color: var(--h-text-2); font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">${d.code || '—'}</td>
                <td>
                    <strong>${d.name}</strong>
                </td>
                <td style="text-align:right;">${fmtMoney(d.marketValue)}</td>
                <td style="text-align:right;" class="${d.profit >= 0 ? 'text-success' : 'text-danger'}">
                    ${d.profit >= 0 ? '+' : ''}${fmtMoney(d.profit)}
                </td>
                <td style="text-align:right;" class="${d.profit >= 0 ? 'text-success' : 'text-danger'}">
                    ${d.profit >= 0 ? '+' : ''}${(d.profitRate * 100).toFixed(2)}%
                </td>
                <td style="text-align:right; color: var(--h-text-2);">${d.cost > 0 ? fmtMoney(d.cost) : '—'}</td>
                <td style="color: var(--h-text-2); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${(d.remark || '').replace(/"/g, '&quot;')}">${d.remark || '—'}</td>
                <td>
                    <div class="weight-bar" title="${(d.weight * 100).toFixed(2)}%">
                        <span style="width:${(d.weight * 100).toFixed(2)}%"></span>
                    </div>
                    <div class="text-muted" style="font-size: 0.75rem; margin-top: 4px;">${(d.weight * 100).toFixed(2)}%</div>
                </td>
            </tr>`;
        }).join('');
    }

    document.getElementById('detailSummary').textContent =
        '共 ' + m.count + ' 只标的 · 总市值 ¥ ' + fmtMoney(m.totalMarket) + ' · 现金 ¥ ' + fmtMoney(m.totalCash) + ' · 总资产 ¥ ' + fmtMoney(m.totalAsset) + ' · 累计收益 ' + (m.totalProfit >= 0 ? '+' : '') + fmtMoney(m.totalProfit) + '（' + (m.totalProfitRate >= 0 ? '+' : '') + (m.totalProfitRate * 100).toFixed(2) + '%）';
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
