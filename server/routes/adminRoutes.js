const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { requireCsrf } = require('../middleware/csrf');
const { z, validateBody, validateParams, validateQuery } = require('../middleware/validate');
const controller = require('../controllers/adminController');

const router = express.Router();
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id format');
const idParams = z.object({ id: objectId });
const difficulty = z.enum(['easy', 'medium', 'hard']);
const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};

const usersQuery = z.object({
  ...pagination,
  search: z.string().max(100).optional().default(''),
  role: z.enum(['user', 'moderator', 'admin']).optional(),
  isBlocked: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
});

const questionsQuery = z.object({
  ...pagination,
  category: objectId.optional(),
  difficulty: difficulty.optional(),
  search: z.string().max(100).optional().default(''),
});

const questionSchema = z
  .object({
    category: objectId,
    difficulty,
    topic: z.string().trim().min(2).max(120).default('General'),
    question: z.string().trim().min(8).max(500),
    options: z.array(z.string().trim().min(1).max(250)).min(2).max(6),
    answer: z.string().trim().min(1).max(250),
    explanation: z.string().trim().max(500).optional().default(''),
  })
  .superRefine((value, ctx) => {
    if (!value.options.includes(value.answer)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Answer must match an option.', path: ['answer'] });
    }
    if (new Set(value.options.map((item) => item.toLowerCase())).size !== value.options.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Options must be unique.', path: ['options'] });
    }
  });

const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).optional().default(''),
  icon: z.string().trim().max(40).optional().default('book-open'),
});

const challengeSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().min(5).max(300),
  category: objectId,
  difficulty,
  rewardXP: z.coerce.number().int().min(10).max(10_000),
  activeDate: z.coerce.date(),
});

const achievementSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(5).max(280),
  icon: z.string().trim().min(1).max(80),
  xpReward: z.coerce.number().int().min(0).max(100_000),
  conditionType: z.enum([
    'total_quizzes',
    'streak_days',
    'high_accuracy_quizzes',
    'perfect_scores',
    'hard_quiz_wins',
    'total_xp',
  ]),
  conditionValue: z.coerce.number().int().min(1).max(1_000_000),
});

router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', controller.dashboard);
router.get('/users', validateQuery(usersQuery), controller.listUsers);
router.put('/users/:id/block', requireCsrf, validateParams(idParams), validateBody(z.object({ isBlocked: z.boolean() })), controller.blockUser);
router.put('/users/:id/role', requireCsrf, validateParams(idParams), validateBody(z.object({ role: z.enum(['user', 'moderator', 'admin']), rolePermissions: z.array(z.string().max(100)).max(50).optional() })), controller.updateUserRole);
router.delete('/users/:id', requireCsrf, validateParams(idParams), controller.removeUser);

router.get('/questions', validateQuery(questionsQuery), controller.listQuestions);
router.post('/questions', requireCsrf, validateBody(questionSchema), controller.createQuestion);
router.put('/questions/:id', requireCsrf, validateParams(idParams), validateBody(questionSchema), controller.updateQuestion);
router.delete('/questions/:id', requireCsrf, validateParams(idParams), controller.removeQuestion);

router.get('/categories', controller.listCategories);
router.post('/categories', requireCsrf, validateBody(categorySchema), controller.createCategory);
router.put('/categories/:id', requireCsrf, validateParams(idParams), validateBody(categorySchema), controller.updateCategory);
router.delete('/categories/:id', requireCsrf, validateParams(idParams), controller.removeCategory);

router.get('/challenges', controller.listChallenges);
router.post('/challenges', requireCsrf, validateBody(challengeSchema), controller.createChallenge);
router.put('/challenges/:id', requireCsrf, validateParams(idParams), validateBody(challengeSchema), controller.updateChallenge);
router.delete('/challenges/:id', requireCsrf, validateParams(idParams), controller.removeChallenge);

router.get('/achievements', controller.listAchievements);
router.post('/achievements', requireCsrf, validateBody(achievementSchema), controller.createAchievement);
router.put('/achievements/:id', requireCsrf, validateParams(idParams), validateBody(achievementSchema), controller.updateAchievement);
router.delete('/achievements/:id', requireCsrf, validateParams(idParams), controller.removeAchievement);

module.exports = router;
