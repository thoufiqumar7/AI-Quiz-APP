const express = require('express');
const { startQuiz, submitQuiz, getQuizHistory } = require('../controllers/quizController');
const { requireAuth } = require('../middleware/auth');
const { z, validateBody, validateQuery } = require('../middleware/validate');

const router = express.Router();
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id format');

const startQuizQuerySchema = z.object({
  categoryId: objectIdSchema,
  difficulty: z.enum(['easy', 'medium', 'hard']),
  count: z.coerce.number().int().min(5).max(20).default(10),
});

const submitQuizSchema = z.object({
  sessionId: objectIdSchema,
  answers: z.array(
    z.object({
      questionId: objectIdSchema,
      selectedOption: z.string().nullable(),
    })
  ).min(1),
});

router.get('/start', requireAuth, validateQuery(startQuizQuerySchema), startQuiz);
router.post('/submit', requireAuth, validateBody(submitQuizSchema), submitQuiz);
router.get('/history', requireAuth, getQuizHistory);

module.exports = router;
