const { completeDailyChallenge, getDailyChallengeForUser } = require('../services/challengeService');
const { unlockEligibleAchievements } = require('../services/achievementService');

async function dailyChallenge(req, res, next) {
  try {
    const challenge = await getDailyChallengeForUser(req.user._id);
    res.json({ success: true, challenge });
  } catch (error) {
    next(error);
  }
}

async function completeChallenge(req, res, next) {
  try {
    const { challengeId } = req.body;
    const result = await completeDailyChallenge(req.user._id, challengeId);
    const unlocked = await unlockEligibleAchievements(req.user._id);
    res.json({ success: true, result: { ...result, unlockedAchievements: unlocked.unlocked } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  dailyChallenge,
  completeChallenge,
};
