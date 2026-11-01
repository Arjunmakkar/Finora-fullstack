const express = require('express');
const { z } = require('zod');
const prisma = require('../config/prisma');
const requireAuth = require('../middleware/auth');
const AppError = require('../utils/AppError');

const router = express.Router();
router.use(requireAuth);

function toGoalDTO(goal) {
  const progressPercent = goal.targetAmount > 0 ? Math.round((goal.savedAmount / goal.targetAmount) * 100) : 0;
  const remaining = goal.targetAmount - goal.savedAmount;
  const monthsLeft = Math.max(
    1,
    Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30))
  );
  const requiredMonthly = Math.ceil(remaining / monthsLeft);
  const onTrack = goal.monthlyContribution >= requiredMonthly || remaining <= 0;
  return {
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount,
    savedAmount: goal.savedAmount,
    monthlyContribution: goal.monthlyContribution,
    deadline: goal.deadline,
    createdAt: goal.createdAt,
    progressPercent,
    remaining: Math.max(0, remaining),
    monthsLeft,
    requiredMonthly,
    onTrack,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const goals = await prisma.goal.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' } });
    res.json({ goals: goals.map(toGoalDTO) });
  } catch (err) {
    next(err);
  }
});

const moneyValidation = z
  .number({ invalid_type_error: 'Amount must be a number' })
  .finite('Amount must be a finite number')
  .min(0, 'Amount cannot be negative')
  .max(100_000_000, 'Amount exceeds maximum allowable threshold')
  .refine(
    (val) => {
      const paise = Math.round(val * 100);
      return Math.abs(val * 100 - paise) < 0.0001;
    },
    { message: 'Amount cannot contain fractional paise (max 2 decimal places)' }
  );

const goalSchema = z.object({
  name: z.string().trim().min(1, 'Goal name is required').max(100),
  targetAmount: moneyValidation.refine((val) => val > 0, { message: 'Target amount must be positive' }),
  savedAmount: moneyValidation.optional(),
  monthlyContribution: moneyValidation,
  deadline: z.string().min(1, 'Deadline is required'),
});

router.post('/', async (req, res, next) => {
  try {
    const data = goalSchema.parse(req.body);
    const goal = await prisma.goal.create({
      data: {
        userId: req.userId,
        name: data.name,
        targetAmount: Math.round(data.targetAmount * 100),
        savedAmount: Math.round((data.savedAmount || 0) * 100),
        monthlyContribution: Math.round(data.monthlyContribution * 100),
        deadline: new Date(data.deadline),
      },
    });
    res.status(201).json({ goal: toGoalDTO(goal) });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: { message: err.errors[0].message } });
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.goal.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new AppError('Goal not found', 404);
    const data = goalSchema.partial().parse(req.body);
    const updateData = { ...data };
    if (data.targetAmount != null) updateData.targetAmount = Math.round(data.targetAmount * 100);
    if (data.savedAmount != null) updateData.savedAmount = Math.round(data.savedAmount * 100);
    if (data.monthlyContribution != null) updateData.monthlyContribution = Math.round(data.monthlyContribution * 100);
    if (data.deadline) updateData.deadline = new Date(data.deadline);
    const goal = await prisma.goal.update({ where: { id: existing.id }, data: updateData });
    res.json({ goal: toGoalDTO(goal) });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: { message: err.errors[0].message } });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.goal.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new AppError('Goal not found', 404);
    await prisma.goal.delete({ where: { id: existing.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
