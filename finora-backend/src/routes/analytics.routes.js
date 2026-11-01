const express = require('express');
const requireAuth = require('../middleware/auth');
const analytics = require('../services/analytics.service');

const router = express.Router();
router.use(requireAuth);

router.get('/summary', async (req, res, next) => {
  try {
    res.json(await analytics.getDashboardSummary(req.userId));
  } catch (err) {
    next(err);
  }
});

router.get('/net-worth', async (req, res, next) => {
  try {
    const series = await analytics.getNetWorthSeries(req.userId, req.query.range || '1M');
    res.json({ series });
  } catch (err) {
    next(err);
  }
});

router.get('/cash-flow', async (req, res, next) => {
  try {
    const series = await analytics.getCashFlow(req.userId, 6);
    res.json({ series });
  } catch (err) {
    next(err);
  }
});

router.get('/spending-breakdown', async (req, res, next) => {
  try {
    const breakdown = await analytics.getSpendingBreakdown(req.userId, req.query.range || '1M');
    res.json({ breakdown });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
