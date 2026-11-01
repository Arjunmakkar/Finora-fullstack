const express = require('express');
const { z } = require('zod');
const prisma = require('../config/prisma');
const requireAuth = require('../middleware/auth');
const AppError = require('../utils/AppError');
const { encrypt, decrypt } = require('../utils/crypto');

const router = express.Router();
router.use(requireAuth);

function rangeToDate(range) {
  const now = new Date();
  const map = { '7D': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };
  const days = map[range] ?? 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

// Strict response DTO mapper: never expose internal model directly & decrypt sensitive fields
function toTransactionDTO(tx) {
  return {
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    category: tx.category,
    description: tx.description,
    merchant: tx.merchant || null,
    date: tx.date,
    paymentMethod: tx.paymentMethod,
    recurring: Boolean(tx.recurring),
    notes: tx.notes ? decrypt(tx.notes) : null,
    createdAt: tx.createdAt,
  };
}

// GET /api/transactions?range=1M&category=Food&search=swiggy&sort=date_desc
router.get('/', async (req, res, next) => {
  try {
    const { range, category, search, sort = 'date_desc' } = req.query;
    const where = { userId: req.userId };
    if (range) where.date = { gte: rangeToDate(range) };
    if (category && category !== 'All') where.category = category;
    if (search && typeof search === 'string') {
      where.OR = [
        { description: { contains: search } },
        { merchant: { contains: search } },
      ];
    }
    const [field, dir] = (typeof sort === 'string' ? sort : 'date_desc').split('_');
    const orderBy = { [field === 'amount' ? 'amount' : 'date']: dir === 'asc' ? 'asc' : 'desc' };

    const transactions = await prisma.transaction.findMany({ where, orderBy, take: 200 });
    res.json({ transactions: transactions.map(toTransactionDTO) });
  } catch (err) {
    next(err);
  }
});

// Strict Money validation: reject NaN, non-integer paise, negative, or absurdly large amounts
const moneyValidation = z
  .number({ invalid_type_error: 'Amount must be a number' })
  .finite('Amount must be a finite number')
  .positive('Amount must be greater than zero')
  .max(100_000_000, 'Amount exceeds maximum allowable threshold')
  .refine(
    (val) => {
      const paise = Math.round(val * 100);
      return Math.abs(val * 100 - paise) < 0.0001;
    },
    { message: 'Amount cannot contain fractional paise (max 2 decimal places)' }
  );

const txSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: moneyValidation,
  category: z.string().trim().min(1, 'Category is required').max(50),
  description: z.string().trim().min(1, 'Description is required').max(200),
  merchant: z.string().trim().max(100).optional(),
  date: z.string().min(1, 'Date is required'),
  paymentMethod: z.string().trim().max(50).optional(),
  recurring: z.boolean().optional(),
  notes: z.string().trim().max(500).optional(),
});

router.post('/', async (req, res, next) => {
  try {
    const data = txSchema.parse(req.body);
    const amountPaise = Math.round(data.amount * 100);
    const delta = data.type === 'INCOME' ? amountPaise : -amountPaise;
    
    // Execute creation and account balance update atomically in a transaction
    const tx = await prisma.$transaction(async (txPrisma) => {
      let account = await txPrisma.account.findFirst({ where: { userId: req.userId } });
      if (!account) {
        account = await txPrisma.account.create({
          data: { userId: req.userId, name: 'Primary Bank', type: 'BANK', balance: 0 },
        });
      }

      // Update account balance
      await txPrisma.account.update({
        where: { id: account.id },
        data: { balance: { increment: delta } },
      });

      return txPrisma.transaction.create({
        data: {
          userId: req.userId,
          accountId: account.id,
          type: data.type,
          amount: amountPaise,
          category: data.category,
          description: data.description,
          merchant: data.merchant,
          date: new Date(data.date),
          paymentMethod: data.paymentMethod || 'UPI',
          recurring: data.recurring || false,
          notes: data.notes ? encrypt(data.notes) : null,
        },
      });
    });

    res.status(201).json({ transaction: toTransactionDTO(tx) });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: { message: err.errors[0].message } });
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const tx = await prisma.transaction.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!tx) throw new AppError('Transaction not found', 404);
    res.json({ transaction: toTransactionDTO(tx) });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.transaction.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new AppError('Transaction not found', 404);

    const data = txSchema.partial().parse(req.body);
    const updateData = { ...data };
    
    const oldDelta = existing.type === 'INCOME' ? existing.amount : -existing.amount;
    const newType = data.type || existing.type;
    const newAmount = data.amount != null ? Math.round(data.amount * 100) : existing.amount;
    const newDelta = newType === 'INCOME' ? newAmount : -newAmount;
    const balanceDiff = newDelta - oldDelta;

    if (data.amount != null) updateData.amount = newAmount;
    if (data.date) updateData.date = new Date(data.date);
    if (data.notes !== undefined) updateData.notes = data.notes ? encrypt(data.notes) : null;

    const tx = await prisma.$transaction(async (txPrisma) => {
      if (balanceDiff !== 0 && existing.accountId) {
        await txPrisma.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: balanceDiff } },
        });
      }
      return txPrisma.transaction.update({ where: { id: existing.id }, data: updateData });
    });

    res.json({ transaction: toTransactionDTO(tx) });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: { message: err.errors[0].message } });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.transaction.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new AppError('Transaction not found', 404);

    const revertDelta = existing.type === 'INCOME' ? -existing.amount : existing.amount;

    await prisma.$transaction(async (txPrisma) => {
      if (existing.accountId) {
        await txPrisma.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: revertDelta } },
        });
      }
      await txPrisma.transaction.delete({ where: { id: existing.id } });
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;

