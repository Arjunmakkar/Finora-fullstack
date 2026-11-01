const prisma = require('../config/prisma');
const analytics = require('./analytics.service');

/**
 * Weighted composite score (0-100) across 6 factors. Each sub-score is 0-100,
 * then blended by weight. This mirrors what the plan calls out explicitly so
 * it's explainable in an interview: savings rate, budget discipline, emergency
 * fund coverage, debt ratio, investment rate, expense growth trend.
 */
async function computeFinancialHealth(userId) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [income, expenses, lastMonthExpenses, investments, budgets] = await Promise.all([
    prisma.transaction.aggregate({ where: { userId, type: 'INCOME', date: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId, type: 'EXPENSE', date: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE', date: { gte: lastMonthStart, lt: monthStart } },
      _sum: { amount: true },
    }),
    prisma.investment.findMany({ where: { userId } }),
    prisma.budget.findMany({ where: { userId, month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` } }),
  ]);

  const monthlyIncome = income._sum.amount || 0;
  const monthlyExpenses = expenses._sum.amount || 0;
  const prevExpenses = lastMonthExpenses._sum.amount || 0;

  // 1. Savings rate (0-40% treated as 0-100 scale, capped)
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
  const savingsScore = Math.max(0, Math.min(100, (savingsRate / 40) * 100));

  // 2. Budget discipline: how close to (not over) limits, across all active budgets
  let budgetScore = 100;
  if (budgets.length > 0) {
    let overCount = 0;
    for (const b of budgets) {
      const spentAgg = await prisma.transaction.aggregate({
        where: { userId, category: b.category, type: 'EXPENSE', date: { gte: monthStart } },
        _sum: { amount: true },
      });
      const spent = spentAgg._sum.amount || 0;
      if (spent > b.limitAmount) overCount++;
    }
    budgetScore = Math.max(0, 100 - (overCount / budgets.length) * 100);
  }

  // 3. Emergency fund: (liquid net position) / (3x monthly expenses) capped at 100
  const investmentValue = investments.reduce((s, i) => s + Math.round(i.currentPrice * i.quantity), 0);
  const emergencyTarget = monthlyExpenses * 3;
  const emergencyScore = emergencyTarget > 0 ? Math.max(0, Math.min(100, (investmentValue / emergencyTarget) * 100)) : 50;

  // 4. Debt ratio — no liability model yet, so treated as neutral-good until loans/credit are tracked
  const debtScore = 85;

  // 5. Investment rate: investments as a % of income, capped
  const investmentRate = monthlyIncome > 0 ? (investmentValue / (monthlyIncome * 12)) * 100 : 0;
  const investmentScore = Math.max(0, Math.min(100, investmentRate * 2));

  // 6. Expense growth: penalize if expenses grew month over month
  let expenseGrowthPercent = 0;
  let expenseGrowthScore = 100;
  if (prevExpenses > 0) {
    expenseGrowthPercent = Number((((monthlyExpenses - prevExpenses) / prevExpenses) * 100).toFixed(1));
    expenseGrowthScore = Math.max(0, 100 - Math.max(0, expenseGrowthPercent) * 3);
  }

  const weights = { savings: 0.3, budget: 0.2, emergency: 0.2, debt: 0.1, investment: 0.1, expenseGrowth: 0.1 };
  const score = Math.round(
    savingsScore * weights.savings +
      budgetScore * weights.budget +
      emergencyScore * weights.emergency +
      debtScore * weights.debt +
      investmentScore * weights.investment +
      expenseGrowthScore * weights.expenseGrowth
  );

  const label = score >= 85 ? 'Excellent' : score >= 70 ? 'Very Good' : score >= 50 ? 'Fair' : 'Needs Attention';

  const insights = [];
  if (savingsRate > 20) insights.push({ type: 'positive', message: `Your savings rate is ${savingsRate.toFixed(1)}%, well above the 20% benchmark.` });
  else if (monthlyIncome > 0) insights.push({ type: 'warning', message: `Your savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 20%.` });

  if (expenseGrowthPercent > 10) insights.push({ type: 'warning', message: `Expenses grew ${expenseGrowthPercent}% vs. last month.` });
  else if (expenseGrowthPercent < 0) insights.push({ type: 'positive', message: `Expenses dropped ${Math.abs(expenseGrowthPercent)}% vs. last month.` });

  if (emergencyScore < 50) insights.push({ type: 'suggestion', message: 'Building a 3-month expense buffer would meaningfully improve this score.' });

  return {
    score,
    label,
    breakdown: {
      savingsRate: Math.round(savingsScore),
      budgetDiscipline: Math.round(budgetScore),
      emergencyFund: Math.round(emergencyScore),
      debtRatio: Math.round(debtScore),
      investmentRate: Math.round(investmentScore),
      expenseGrowth: Math.round(expenseGrowthScore),
    },
    insights,
  };
}

module.exports = { computeFinancialHealth };
