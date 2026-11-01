const express = require('express');
const { z } = require('zod');
const prisma = require('../config/prisma');
const requireAuth = require('../middleware/auth');
const AppError = require('../utils/AppError');

const router = express.Router();
router.use(requireAuth);

function monthlyEquivalent(sub) {
  if (sub.billingCycle === 'YEARLY') return Math.round(sub.price / 12);
  if (sub.billingCycle === 'WEEKLY') return Math.round(sub.price * 4.33);
  return sub.price;
}

function toSubscriptionDTO(sub) {
  return {
    id: sub.id,
    name: sub.name,
    price: sub.price,
    billingCycle: sub.billingCycle,
    nextPayment: sub.nextPayment,
    category: sub.category,
    paymentMethod: sub.paymentMethod,
    active: Boolean(sub.active),
  };
}

router.get('/', async (req, res, next) => {
  try {
    const subs = await prisma.subscription.findMany({
      where: { userId: req.userId, active: true },
      orderBy: { nextPayment: 'asc' },
    });
    const monthlyTotal = subs.reduce((s, sub) => s + monthlyEquivalent(sub), 0);
    res.json({
      subscriptions: subs.map(toSubscriptionDTO),
      monthlyTotal,
      annualTotal: monthlyTotal * 12,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/upcoming', async (req, res, next) => {
  try {
    const in14 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const upcoming = await prisma.subscription.findMany({
      where: { userId: req.userId, active: true, nextPayment: { lte: in14 } },
      orderBy: { nextPayment: 'asc' },
    });
    res.json({ upcoming: upcoming.map(toSubscriptionDTO) });
  } catch (err) {
    next(err);
  }
});

const priceValidation = z
  .number({ invalid_type_error: 'Price must be a number' })
  .finite('Price must be a finite number')
  .positive('Price must be greater than zero')
  .max(10_000_000, 'Price exceeds allowable maximum')
  .refine(
    (val) => {
      const paise = Math.round(val * 100);
      return Math.abs(val * 100 - paise) < 0.0001;
    },
    { message: 'Price cannot contain fractional paise (max 2 decimal places)' }
  );

const subSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  price: priceValidation,
  billingCycle: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
  nextPayment: z.string().min(1, 'Next payment date is required'),
  category: z.string().trim().min(1, 'Category is required').max(50),
  paymentMethod: z.string().trim().max(50).optional(),
});

router.post('/', async (req, res, next) => {
  try {
    const data = subSchema.parse(req.body);
    const sub = await prisma.subscription.create({
      data: {
        userId: req.userId,
        name: data.name,
        price: Math.round(data.price * 100),
        billingCycle: data.billingCycle,
        nextPayment: new Date(data.nextPayment),
        category: data.category,
        paymentMethod: data.paymentMethod || 'UPI',
      },
    });
    res.status(201).json({ subscription: toSubscriptionDTO(sub) });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: { message: err.errors[0].message } });
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.subscription.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new AppError('Subscription not found', 404);
    const data = subSchema.partial().extend({ active: z.boolean().optional() }).parse(req.body);
    const updateData = { ...data };
    if (data.price != null) updateData.price = Math.round(data.price * 100);
    if (data.nextPayment) updateData.nextPayment = new Date(data.nextPayment);
    const sub = await prisma.subscription.update({ where: { id: existing.id }, data: updateData });
    res.json({ subscription: toSubscriptionDTO(sub) });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: { message: err.errors[0].message } });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.subscription.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new AppError('Subscription not found', 404);
    await prisma.subscription.delete({ where: { id: existing.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
