require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const errorHandler = require('./middleware/errorHandler');
const requireAuth = require('./middleware/auth');

const app = express();

// Web hardening: helmet security headers & Content Security Policy (strict, no unsafe-inline)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.CLIENT_ORIGIN || 'http://localhost:5173'],
        objectSrc: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS: explicit origin allowlist with credentials. Never * with credentials.
const allowedOrigins = [process.env.CLIENT_ORIGIN || 'http://localhost:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS origin allowlist'));
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// Public routes explicitly listed
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth.routes'));

// Default-Deny Authorization Gate: All other /api/* routes require authentication by default
app.use('/api', requireAuth);

// Protected resource routes
app.use('/api/transactions', require('./routes/transactions.routes'));
app.use('/api/budgets', require('./routes/budgets.routes'));
app.use('/api/investments', require('./routes/investments.routes'));
app.use('/api/goals', require('./routes/goals.routes'));
app.use('/api/subscriptions', require('./routes/subscriptions.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/financial-health', require('./routes/financialHealth.routes'));
app.use('/api/assistant', require('./routes/assistant.routes'));

app.use((req, res) => res.status(404).json({ error: { message: 'Not found' } }));
app.use(errorHandler);

module.exports = app;
