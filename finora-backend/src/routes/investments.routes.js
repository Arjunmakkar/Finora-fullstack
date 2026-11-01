const express = require('express');
const { z } = require('zod');
const prisma = require('../config/prisma');
const requireAuth = require('../middleware/auth');
const AppError = require('../utils/AppError');

const router = express.Router();
router.use(requireAuth);

function toInvestmentDTO(inv) {
  const invested = Math.round(inv.purchasePrice * inv.quantity);
  const currentValue = Math.round(inv.currentPrice * inv.quantity);
  const profitLoss = currentValue - invested;
  const returnPercent = invested > 0 ? Number(((profitLoss / invested) * 100).toFixed(2)) : 0;
  return {
    id: inv.id,
    assetName: inv.assetName,
    symbol: inv.symbol || null,
    assetType: inv.assetType,
    quantity: inv.quantity,
    purchasePrice: inv.purchasePrice,
    currentPrice: inv.currentPrice,
    purchaseDate: inv.purchaseDate,
    invested,
    currentValue,
    profitLoss,
    returnPercent,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const investments = await prisma.investment.findMany({ where: { userId: req.userId } });
    res.json({ investments: investments.map(toInvestmentDTO) });
  } catch (err) {
    next(err);
  }
});

router.get('/summary', async (req, res, next) => {
  try {
    const investments = (await prisma.investment.findMany({ where: { userId: req.userId } })).map(toInvestmentDTO);
    const totalInvestment = investments.reduce((s, i) => s + i.invested, 0);
    const totalValue = investments.reduce((s, i) => s + i.currentValue, 0);
    const profitLoss = totalValue - totalInvestment;
    const returnPercent = totalInvestment > 0 ? Number(((profitLoss / totalInvestment) * 100).toFixed(2)) : 0;

    const allocation = {};
    for (const inv of investments) {
      allocation[inv.assetType] = (allocation[inv.assetType] || 0) + inv.currentValue;
    }

    res.json({
      totalPortfolioValue: totalValue,
      totalInvestment,
      profitLoss,
      returnPercent,
      allocation,
    });
  } catch (err) {
    next(err);
  }
});

const priceValidation = z
  .number({ invalid_type_error: 'Price must be a number' })
  .finite('Price must be a finite number')
  .positive('Price must be greater than zero')
  .max(100_000_000, 'Price exceeds allowable maximum')
  .refine(
    (val) => {
      const paise = Math.round(val * 100);
      return Math.abs(val * 100 - paise) < 0.0001;
    },
    { message: 'Price cannot contain fractional paise (max 2 decimal places)' }
  );

const invSchema = z.object({
  assetName: z.string().trim().min(1, 'Asset name is required').max(100),
  symbol: z.string().trim().max(20).optional(),
  assetType: z.enum(['STOCK', 'MUTUAL_FUND', 'ETF', 'GOLD', 'FD', 'OTHER']),
  quantity: z.number().finite().positive('Quantity must be greater than zero').max(10_000_000),
  purchasePrice: priceValidation,
  currentPrice: priceValidation,
  purchaseDate: z.string().min(1, 'Purchase date is required'),
});

router.post('/', async (req, res, next) => {
  try {
    const data = invSchema.parse(req.body);
    const inv = await prisma.investment.create({
      data: {
        userId: req.userId,
        assetName: data.assetName,
        symbol: data.symbol,
        assetType: data.assetType,
        quantity: data.quantity,
        purchasePrice: Math.round(data.purchasePrice * 100),
        currentPrice: Math.round(data.currentPrice * 100),
        purchaseDate: new Date(data.purchaseDate),
      },
    });
    res.status(201).json({ investment: toInvestmentDTO(inv) });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: { message: err.errors[0].message } });
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.investment.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new AppError('Investment not found', 404);
    const data = invSchema.partial().parse(req.body);
    const updateData = { ...data };
    if (data.purchasePrice != null) updateData.purchasePrice = Math.round(data.purchasePrice * 100);
    if (data.currentPrice != null) updateData.currentPrice = Math.round(data.currentPrice * 100);
    if (data.purchaseDate) updateData.purchaseDate = new Date(data.purchaseDate);
    const inv = await prisma.investment.update({ where: { id: existing.id }, data: updateData });
    res.json({ investment: toInvestmentDTO(inv) });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: { message: err.errors[0].message } });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.investment.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new AppError('Investment not found', 404);
    await prisma.investment.delete({ where: { id: existing.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
