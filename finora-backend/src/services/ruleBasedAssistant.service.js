const prisma = require('../config/prisma');
const analytics = require('./analytics.service');
const { computeFinancialHealth } = require('./financialHealth.service');

function rupees(paise) {
  return `₹${Math.round(paise / 100).toLocaleString('en-IN')}`;
}

function monthRange(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
  return { start, end };
}

/**
 * Rule-based provider — pattern matches the question against known intents,
 * then calls the exact same service functions the REST API uses. This is the
 * `ruleBasedProvider` from the architecture plan; an `llmProvider` implementing
 * the same `answer(question, userId)` signature can be swapped in later.
 */
async function answer(question, userId) {
  const q = question.toLowerCase();

  // Category alias dictionary for intelligent intent mapping
  const categoryAliases = {
    Food: ['food', 'dining', 'dinner', 'lunch', 'groceries', 'grocery', 'swiggy', 'zomato', 'restaurant', 'cafe'],
    Transport: ['transport', 'travel', 'commute', 'cab', 'taxi', 'uber', 'ola', 'metro', 'fuel', 'petrol'],
    Shopping: ['shopping', 'clothes', 'amazon', 'flipkart', 'myntra', 'shoes', 'electronics'],
    Rent: ['rent', 'housing', 'apartment'],
    Bills: ['bill', 'bills', 'utilities', 'electricity', 'wifi', 'water', 'recharge'],
    Entertainment: ['entertainment', 'movies', 'movie', 'netflix', 'spotify', 'games', 'gaming'],
    Healthcare: ['health', 'healthcare', 'medical', 'medicine', 'doctor', 'hospital'],
    Education: ['education', 'course', 'tuition', 'books'],
    Subscriptions: ['subscription', 'subscriptions'],
    Investments: ['investment', 'investments', 'stocks', 'mutual fund', 'sip'],
  };

  let matchedCategory = null;
  for (const [catName, keywords] of Object.entries(categoryAliases)) {
    if (keywords.some((kw) => q.includes(kw))) {
      matchedCategory = catName;
      break;
    }
  }

  if (matchedCategory && (q.includes('spend') || q.includes('spent') || q.includes('cost') || q.includes('how much'))) {
    const { start, end } = monthRange(0);
    const agg = await prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE', category: matchedCategory, date: { gte: start, lt: end } },
      _sum: { amount: true },
    });
    const total = agg._sum.amount || 0;
    return {
      answer: `You've spent ${rupees(total)} on ${matchedCategory} this month.`,
      data: { category: matchedCategory, amount: total },
    };
  }

  // "Which category increased the most?"
  if (q.includes('increased') || q.includes('went up') || (q.includes('category') && q.includes('most'))) {
    const breakdown = await analytics.getSpendingBreakdown(userId, '1M');
    const risers = breakdown.filter((b) => b.changePercent != null && b.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent);
    if (risers.length === 0) return { answer: "No category increased compared to last period — nice.", data: {} };
    const top = risers[0];
    return { answer: `${top.category} increased the most — up ${top.changePercent}% vs. the previous period.`, data: top };
  }

  // "How much did I save last month?"
  if (q.includes('save') && q.includes('last month')) {
    const { start, end } = monthRange(1);
    const [inc, exp] = await Promise.all([
      prisma.transaction.aggregate({ where: { userId, type: 'INCOME', date: { gte: start, lt: end } }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { userId, type: 'EXPENSE', date: { gte: start, lt: end } }, _sum: { amount: true } }),
    ]);
    const saved = (inc._sum.amount || 0) - (exp._sum.amount || 0);
    return { answer: `You saved ${rupees(saved)} last month.`, data: { saved } };
  }

  // "Can I afford a ₹X laptop/purchase?"
  const affordMatch = q.match(/afford.*?(?:₹|rs\.?|inr)?\s?([\d,]+)/i);
  if (affordMatch) {
    const amount = Number(affordMatch[1].replace(/,/g, '')) * 100;
    const summary = await analytics.getDashboardSummary(userId);
    const monthsOfCashFlow = summary.cashFlow > 0 ? amount / summary.cashFlow : Infinity;
    if (summary.cashFlow > 0 && monthsOfCashFlow <= 2) {
      return {
        answer: `Yes — at your current monthly cash flow of ${rupees(summary.cashFlow)}, that would take about ${monthsOfCashFlow.toFixed(1)} month(s) to cover comfortably.`,
        data: { amount, monthsOfCashFlow },
      };
    }
    return {
      answer: `That would take roughly ${Number.isFinite(monthsOfCashFlow) ? monthsOfCashFlow.toFixed(1) : 'many'} months of your current cash flow (${rupees(summary.cashFlow)}/mo) to cover without dipping into savings — worth planning for rather than an impulse buy.`,
      data: { amount, monthsOfCashFlow },
    };
  }

  // "Which subscriptions cost me the most?"
  if (q.includes('subscription')) {
    const subs = await prisma.subscription.findMany({ where: { userId, active: true }, orderBy: { price: 'desc' }, take: 3 });
    if (subs.length === 0) return { answer: "You don't have any active subscriptions tracked yet.", data: {} };
    const list = subs.map((s) => `${s.name} (${rupees(s.price)}/${s.billingCycle.toLowerCase()})`).join(', ');
    return { answer: `Your priciest subscriptions are: ${list}.`, data: { subscriptions: subs } };
  }

  // "How can I save ₹X more each month?"
  const saveMoreMatch = q.match(/save.*?(?:₹|rs\.?|inr)?\s?([\d,]+).*more/i);
  if (saveMoreMatch) {
    const target = Number(saveMoreMatch[1].replace(/,/g, '')) * 100;
    const breakdown = await analytics.getSpendingBreakdown(userId, '1M');
    const discretionary = breakdown.filter((b) => ['Entertainment', 'Shopping', 'Subscriptions', 'Food'].includes(b.category));
    const totalDiscretionary = discretionary.reduce((s, b) => s + b.amount, 0);
    if (totalDiscretionary === 0) {
      return { answer: "I don't see enough discretionary spending data yet to suggest specific cuts — add a few more transactions.", data: {} };
    }
    const suggestions = discretionary
      .map((b) => ({ ...b, cutAmount: Math.round(b.amount * Math.min(0.3, target / totalDiscretionary)) }))
      .filter((b) => b.cutAmount > 0)
      .sort((a, b) => b.cutAmount - a.cutAmount);
    const lines = suggestions.slice(0, 3).map((s) => `${rupees(s.cutAmount)} from ${s.category}`).join(', ');
    return { answer: `Trimming ${lines} would get you close to that ${rupees(target)}/month target.`, data: { suggestions } };
  }

  // Financial health / score questions
  if (q.includes('health') || q.includes('score')) {
    const health = await computeFinancialHealth(userId);
    return { answer: `Your financial health score is ${health.score}/100 (${health.label}).`, data: health };
  }

  // Net worth
  if (q.includes('net worth')) {
    const summary = await analytics.getDashboardSummary(userId);
    return { answer: `Your current net worth is ${rupees(summary.netWorth)}.`, data: { netWorth: summary.netWorth } };
  }

  return {
    answer:
      "I can answer things like: \"How much did I spend on food this month?\", \"Which category increased the most?\", \"How much did I save last month?\", \"Can I afford a ₹60,000 laptop?\", \"Which subscriptions cost me the most?\", or \"How can I save ₹10,000 more each month?\"",
    data: {},
  };
}

module.exports = { answer };
