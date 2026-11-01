const express = require('express');
const { z } = require('zod');
const prisma = require('../config/prisma');
const requireAuth = require('../middleware/auth');
const AppError = require('../utils/AppError');

const router = express.Router();
router.use(requireAuth);

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

async function withSpent(userId, budget) {
  const [year, month] = budget.month.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const agg = await prisma.transaction.aggregate({
    where: { userId, category: budget.category, type: 'EXPENSE', date: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  const spent = agg._sum.amount || 0;
  const percentUsed = budget.limitAmount > 0 ? Math.round((spent / budget.limitAmount) * 100) : 0;
  return {
    id: budget.id,
    category: budget.category,
    month: budget.month,
    limitAmount: budget.limitAmount,
    spent,
    remaining: budget.limitAmount - spent,
    percentUsed,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const month = (typeof req.query.month === 'string' && /^\d{4}-\d{2}$/.test(req.query.month))
      ? req.query.month
      : currentMonth();
    const budgets = await prisma.budget.findMany({ where: { userId: req.userId, month } });
    const withData = await Promise.all(budgets.map((b) => withSpent(req.userId, b)));
    res.json({ budgets: withData });
  } catch (err) {
    next(err);
  }
});

const moneyValidation = z
  .number({ invalid_type_error: 'Limit amount must be a number' })
  .finite('Limit amount must be a finite number')
  .positive('Limit amount must be greater than zero')
  .max(100_000_000, 'Limit amount exceeds allowable maximum')
  .refine(
    (val) => {
      const paise = Math.round(val * 100);
      return Math.abs(val * 100 - paise) < 0.0001;
    },
    { message: 'Amount cannot contain fractional paise (max 2 decimal places)' }
  );

const budgetSchema = z.object({
  category: z.string().trim().min(1, 'Category is required').max(50),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format').optional(),
  limitAmount: moneyValidation,
});

router.post('/', async (req, res, next) => {
  try {
    const data = budgetSchema.parse(req.body);
    const targetMonth = data.month || currentMonth();

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month: {
          userId: req.userId,
          category: data.category,
          month: targetMonth,
        },
      },
      update: { limitAmount: Math.round(data.limitAmount * 100) },
      create: {
        userId: req.userId,
        category: data.category,
        month: targetMonth,
        limitAmount: Math.round(data.limitAmount * 100),
      },
    });
    res.status(201).json({ budget: await withSpent(req.userId, budget) });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: { message: err.errors[0].message } });
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.budget.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new AppError('Budget not found', 404);

    const data = budgetSchema.partial().parse(req.body);
    const updateData = { ...data };
    if (data.limitAmount != null) updateData.limitAmount = Math.round(data.limitAmount * 100);

    const budget = await prisma.budget.update({ where: { id: existing.id }, data: updateData });
    res.json({ budget: await withSpent(req.userId, budget) });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: { message: err.errors[0].message } });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.budget.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new AppError('Budget not found', 404);
    await prisma.budget.delete({ where: { id: existing.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
