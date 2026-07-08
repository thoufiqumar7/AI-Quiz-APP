const express = require('express');
const { getCategories } = require('../controllers/categoryController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, getCategories);

module.exports = router;
