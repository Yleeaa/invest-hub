/* ===== 导航栏交互 ===== */
function initNav() {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.nav-menu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('open');
        });

        // 点击菜单项后关闭（移动端）
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('open');
            });
        });
    }

    // 高亮当前页
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === current || (current === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

/* ===== Toast 提示 ===== */
function showToast(msg, type = '') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast show ' + type;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2200);
}

/* ===== 模态框 ===== */
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('show');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('show');
}

// 点击遮罩关闭
document.addEventListener('click', (e) => {
    if (e.target.classList && e.target.classList.contains('modal-mask')) {
        e.target.classList.remove('show');
    }
});

// ESC 关闭
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-mask.show').forEach(m => m.classList.remove('show'));
    }
});

/* ===== 数字格式化 ===== */
function fmtMoney(n) {
    if (n === null || n === undefined || isNaN(n)) return '0.00';
    return Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPercent(n) {
    if (n === null || n === undefined || isNaN(n)) return '0.00%';
    return (Number(n) * 100).toFixed(2) + '%';
}

function fmtNum(n) {
    if (n === null || n === undefined || isNaN(n)) return '0';
    return Number(n).toLocaleString('zh-CN');
}

/* ===== 持仓计算工具 ===== */
function calcHoldingMetrics(list) {
    let totalCost = 0;
    let totalMarket = 0;
    const markets = {};
    const types = {};
    const details = list.map(item => {
        const cost = item.shares * item.cost;
        const market = item.shares * item.price;
        const profit = market - cost;
        const profitRate = cost > 0 ? profit / cost : 0;
        totalCost += cost;
        totalMarket += market;
        markets[item.market] = (markets[item.market] || 0) + market;
        types[item.type] = (types[item.type] || 0) + market;
        return {
            ...item,
            cost,
            market,
            profit,
            profitRate
        };
    });
    // 占比
    details.forEach(d => {
        d.weight = totalMarket > 0 ? d.market / totalMarket : 0;
    });
    return {
        totalCost,
        totalMarket,
        totalProfit: totalMarket - totalCost,
        totalProfitRate: totalCost > 0 ? (totalMarket - totalCost) / totalCost : 0,
        count: list.length,
        markets,
        types,
        details
    };
}

/* ===== 启动 ===== */
document.addEventListener('DOMContentLoaded', initNav);
