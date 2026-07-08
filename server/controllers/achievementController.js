const { getUserAchievements, unlockEligibleAchievements } = require('../services/achievementService');

async function listAchievements(req, res, next) {
  try {
    await unlockEligibleAchievements(req.user._id);
    const achievements = await getUserAchievements(req.user._id);
    res.json({ success: true, achievements });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listAchievements,
};
