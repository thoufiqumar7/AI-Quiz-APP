const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { z, validateQuery } = require('../middleware/validate');
const {
  dashboardAnalytics,
  performanceAnalytics,
  historyAnalytics,
  topicAnalytics,
} = require('../controllers/analyticsController');

const router = express.Router();

const topicQuerySchema = z.object({
  refresh: z.coerce.boolean().optional().default(false),
});

router.get('/dashboard', requireAuth, dashboardAnalytics);
router.get('/performance', requireAuth, performanceAnalytics);
router.get('/history', requireAuth, historyAnalytics);
router.get('/topics', requireAuth, validateQuery(topicQuerySchema), topicAnalytics);

module.exports = router;
