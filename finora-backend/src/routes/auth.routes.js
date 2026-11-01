const express = require('express');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const prisma = require('../config/prisma');
const authService = require('../services/auth.service');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const COOKIE_NAME = 'finora_session';
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts. Please try again in 15 minutes.' } },
});

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const { user, token } = await authService.register(data);
    res.cookie(COOKIE_NAME, token, getCookieOptions());
    res.status(201).json({ user: authService.publicUser(user), token });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: { message: err.errors[0].message } });
    if (err.statusCode === 409) return res.status(400).json({ error: { message: 'Unable to register with the provided credentials' } });
    next(err);
  }
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const { user, token } = await authService.login(data);
    res.cookie(COOKIE_NAME, token, getCookieOptions());
    res.json({ user: authService.publicUser(user), token });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: { message: err.errors[0].message } });
    next(err);
  }
});

const googleSchema = z.object({
  credential: z.string().min(1),
});

router.post('/google', authLimiter, async (req, res, next) => {
  try {
    const { credential } = googleSchema.parse(req.body);
    const { user, token } = await authService.loginOrCreateGoogleUser(credential);
    res.cookie(COOKIE_NAME, token, getCookieOptions());
    res.json({ user: authService.publicUser(user), token });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: { message: err.errors[0].message } });
    next(err);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...getCookieOptions(), maxAge: 0 });
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });
    res.json({ user: authService.publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().trim().min(1).max(100).optional(),
      currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
    });
    const data = schema.parse(req.body);
    const user = await prisma.user.update({ where: { id: req.userId }, data });
    res.json({ user: authService.publicUser(user) });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: { message: err.errors[0].message } });
    next(err);
  }
});

// Full account deletion endpoint (removes all of user's rows in a transaction)
router.delete('/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId;
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { userId } }),
      prisma.budget.deleteMany({ where: { userId } }),
      prisma.investment.deleteMany({ where: { userId } }),
      prisma.goal.deleteMany({ where: { userId } }),
      prisma.subscription.deleteMany({ where: { userId } }),
      prisma.account.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
    res.clearCookie(COOKIE_NAME, { ...getCookieOptions(), maxAge: 0 });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
