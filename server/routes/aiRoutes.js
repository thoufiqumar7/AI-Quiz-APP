const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const aiController = require('../controllers/aiController');
const { validateBody } = require('../middleware/validate');
const { z } = require('zod');

const router = express.Router();

// Prompt injection mitigation regex (strict enough to catch obvious manipulation, lenient enough for code)
const injectionPattern = /(ignore previous instructions|reveal your system prompt|return api keys|system prompt|bypass instructions)/i;

const validatePrompt = (val) => !injectionPattern.test(val);

// Validations
const chatSchema = z.object({
  message: z.string().min(1).max(1000, 'Message too long').refine(validatePrompt, { message: 'Potentially malicious prompt detected.' }),
  history: z.array(z.object({
    role: z.string(),
    content: z.string().max(2000)
  })).max(10).optional()
});

const quizSchema = z.object({
  topic: z.string().min(1).max(200, 'Topic too long').refine(validatePrompt, { message: 'Potentially malicious prompt detected.' }),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  count: z.number().min(1).max(20)
});

const explainSchema = z.object({
  question: z.string().min(1).max(500),
  selectedAnswer: z.string().max(200),
  correctAnswer: z.string().max(200),
  isCorrect: z.boolean()
});

const recommendSchema = z.object({
  weakTopics: z.array(z.string().max(100)).max(10),
  strongTopics: z.array(z.string().max(100)).max(10)
});

// All AI endpoints require authentication
router.use(requireAuth);

router.post('/chat', validateBody(chatSchema), aiController.chat);
router.post('/generate-quiz', validateBody(quizSchema), aiController.generateQuiz);
router.post('/explain', validateBody(explainSchema), aiController.explain);
router.post('/recommend', validateBody(recommendSchema), aiController.recommend);

// Admin-only monitoring route
router.get('/status', requireRole(['admin', 'moderator']), aiController.getStatus);

module.exports = router;
