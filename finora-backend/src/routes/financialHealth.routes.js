const express = require('express');
const requireAuth = require('../middleware/auth');
const { computeFinancialHealth } = require('../services/financialHealth.service');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    res.json(await computeFinancialHealth(req.userId));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
