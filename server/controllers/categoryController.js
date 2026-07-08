const Category = require('../models/Category');

async function getCategories(_req, res, next) {
  try {
    const categories = await Category.find().select('name description icon createdAt').sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
};
