const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { z, validateBody } = require('../middleware/validate');
const { dailyChallenge, completeChallenge } = require('../controllers/challengeController');

const router = express.Router();
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id format');

const completeSchema = z.object({
  challengeId: objectIdSchema,
});

router.get('/daily', requireAuth, dailyChallenge);
router.post('/complete', requireAuth, validateBody(completeSchema), completeChallenge);

module.exports = router;
