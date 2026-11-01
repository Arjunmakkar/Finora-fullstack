const express = require('express');
const { z } = require('zod');
const requireAuth = require('../middleware/auth');
const assistant = require('../services/ruleBasedAssistant.service');

const router = express.Router();
router.use(requireAuth);

const schema = z.object({ question: z.string().min(1) });

router.post('/query', async (req, res, next) => {
  try {
    const { question } = schema.parse(req.body);
    const result = await assistant.answer(question, req.userId);
    const currentPeriod = new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(new Date());
    res.json({
      answer: result.answer,
      data: result.data || {},
      source: 'Rule Engine',
      scope: 'Active ledger & verified financial records',
      timeRange: `Current period (${currentPeriod})`,
    });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: { message: err.errors[0].message } });
    next(err);
  }
});

module.exports = router;
