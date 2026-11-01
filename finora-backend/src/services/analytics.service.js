const prisma = require('../config/prisma');

function monthsBack(n) {
  const arr = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    arr.push(d);
  }
  return arr;
}

async function getDashboardSummary(userId) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [incomeAgg, expenseAgg, investSummary, budgets] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: 'INCOME', date: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE', date: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.investment.findMany({ where: { userId } }),
    prisma.budget.findMany({
      where: { userId, month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` },
    }),
  ]);

  const monthlyIncome = incomeAgg._sum.amount || 0;
  const monthlyExpenses = expenseAgg._sum.amount || 0;
  const investmentValue = investSummary.reduce((s, i) => s + Math.round(i.currentPrice * i.quantity), 0);

  // Net worth = all-time income - all-time expenses + investment value (simplified, no liabilities model yet)
  const [allIncome, allExpense] = await Promise.all([
    prisma.transaction.aggregate({ where: { userId, type: 'INCOME' }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId, type: 'EXPENSE' }, _sum: { amount: true } }),
  ]);
  const netWorth = (allIncome._sum.amount || 0) - (allExpense._sum.amount || 0) + investmentValue;

  const cashFlow = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Number(((cashFlow / monthlyIncome) * 100).toFixed(1)) : 0;

  let budgetTotalLimit = 0;
  let budgetTotalSpent = 0;
  for (const b of budgets) {
    const spentAgg = await prisma.transaction.aggregate({
      where: { userId, category: b.category, type: 'EXPENSE', date: { gte: monthStart } },
      _sum: { amount: true },
    });
    budgetTotalLimit += b.limitAmount;
    budgetTotalSpent += spentAgg._sum.amount || 0;
  }
  const budgetUsagePercent = budgetTotalLimit > 0 ? Math.round((budgetTotalSpent / budgetTotalLimit) * 100) : 0;

  return {
    netWorth,
    monthlyIncome,
    monthlyExpenses,
    investmentValue,
    cashFlow,
    savingsRate,
    budgetUsagePercent,
  };
}

async function getNetWorthSeries(userId, range) {
  const map = { '7D': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };
  const days = map[range] || 30;
  const points = 10;
  const step = Math.max(1, Math.floor(days / points));
  const series = [];

  for (let i = points; i >= 0; i--) {
    const asOf = new Date(Date.now() - i * step * 24 * 60 * 60 * 1000);
    const [inc, exp, inv] = await Promise.all([
      prisma.transaction.aggregate({ where: { userId, type: 'INCOME', date: { lte: asOf } }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { userId, type: 'EXPENSE', date: { lte: asOf } }, _sum: { amount: true } }),
      prisma.investment.findMany({ where: { userId, purchaseDate: { lte: asOf } } }),
    ]);
    const investmentValue = inv.reduce((s, x) => s + Math.round(x.currentPrice * x.quantity), 0);
    const value = (inc._sum.amount || 0) - (exp._sum.amount || 0) + investmentValue;
    series.push({ date: asOf.toISOString().slice(0, 10), value });
  }
  return series;
}

async function getCashFlow(userId, months = 6) {
  const result = [];
  for (const monthStart of monthsBack(months)) {
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    const [inc, exp] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME', date: { gte: monthStart, lt: monthEnd } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE', date: { gte: monthStart, lt: monthEnd } },
        _sum: { amount: true },
      }),
    ]);
    result.push({
      month: monthStart.toLocaleString('en-IN', { month: 'short' }),
      income: inc._sum.amount || 0,
      expenses: exp._sum.amount || 0,
    });
  }
  return result;
}

async function getSpendingBreakdown(userId, range) {
  const map = { '7D': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };
  const days = map[range] || 30;
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const prevStart = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000);

  const [current, previous] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['category'],
      where: { userId, type: 'EXPENSE', date: { gte: start } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ['category'],
      where: { userId, type: 'EXPENSE', date: { gte: prevStart, lt: start } },
      _sum: { amount: true },
    }),
  ]);

  const prevMap = Object.fromEntries(previous.map((p) => [p.category, p._sum.amount || 0]));
  const total = current.reduce((s, c) => s + (c._sum.amount || 0), 0);

  return current
    .map((c) => {
      const amount = c._sum.amount || 0;
      const prevAmount = prevMap[c.category] || 0;
      const changePercent = prevAmount > 0 ? Number((((amount - prevAmount) / prevAmount) * 100).toFixed(1)) : null;
      return {
        category: c.category,
        amount,
        percentage: total > 0 ? Number(((amount / total) * 100).toFixed(1)) : 0,
        changePercent,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

module.exports = { getDashboardSummary, getNetWorthSeries, getCashFlow, getSpendingBreakdown };
