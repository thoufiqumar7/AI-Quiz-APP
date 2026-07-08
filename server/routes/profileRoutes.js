const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { gamificationProfile } = require('../controllers/profileController');

const router = express.Router();

router.get('/gamification', requireAuth, gamificationProfile);

module.exports = router;
