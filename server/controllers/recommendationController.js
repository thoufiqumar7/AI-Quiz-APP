const { getPersonalizedRecommendations } = require('../services/recommendationService');

async function getRecommendations(req, res, next) {
  try {
    const recommendations = await getPersonalizedRecommendations(req.user._id, {
      refresh: req.query.refresh === true || req.query.refresh === 'true',
    });
    res.json({ success: true, recommendations });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRecommendations,
};
