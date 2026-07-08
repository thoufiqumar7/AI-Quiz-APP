const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { z, validateBody } = require('../middleware/validate');
const { generateShare } = require('../controllers/shareController');

const router = express.Router();
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id format');

const shareSchema = z
  .object({
    type: z.enum(['score', 'achievement', 'profile']),
    sessionId: objectIdSchema.optional(),
    achievementId: objectIdSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === 'score' && !value.sessionId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'sessionId is required for score type.' });
    }
    if (value.type === 'achievement' && !value.achievementId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'achievementId is required for achievement type.' });
    }
  });

router.post('/generate', requireAuth, validateBody(shareSchema), generateShare);

module.exports = router;
