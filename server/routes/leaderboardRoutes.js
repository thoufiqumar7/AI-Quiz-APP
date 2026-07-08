const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { z, validateQuery } = require('../middleware/validate');
const {
  globalLeaderboard,
  weeklyLeaderboard,
  monthlyLeaderboard,
} = require('../controllers/leaderboardController');

const router = express.Router();

const leaderboardQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

router.get('/global', requireAuth, validateQuery(leaderboardQuerySchema), globalLeaderboard);
router.get('/weekly', requireAuth, validateQuery(leaderboardQuerySchema), weeklyLeaderboard);
router.get('/monthly', requireAuth, validateQuery(leaderboardQuerySchema), monthlyLeaderboard);

module.exports = router;
