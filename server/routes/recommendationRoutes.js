const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { z, validateQuery } = require('../middleware/validate');
const { getRecommendations } = require('../controllers/recommendationController');

const router = express.Router();

const recommendationQuerySchema = z.object({
  refresh: z.coerce.boolean().optional().default(false),
});

router.get('/', requireAuth, validateQuery(recommendationQuerySchema), getRecommendations);

module.exports = router;
