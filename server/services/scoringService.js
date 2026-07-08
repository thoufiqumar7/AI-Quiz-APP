function pointsForDifficulty(difficulty) {
  if (difficulty === 'hard') return 30;
  if (difficulty === 'medium') return 20;
  return 10;
}

function calculateQuizScoring({ answerDetails, timeTaken, timeLimitSec }) {
  const totalQuestions = answerDetails.length;
  const correctAnswers = answerDetails.filter((item) => item.isCorrect).length;
  const wrongAnswers = totalQuestions - correctAnswers;

  const basePoints = answerDetails.reduce((sum, item) => {
    if (!item.isCorrect) return sum;
    return sum + pointsForDifficulty(item.difficulty);
  }, 0);

  const accuracy = totalQuestions
    ? Number(((correctAnswers / totalQuestions) * 100).toFixed(2))
    : 0;

  const safeTimeLimit = Math.max(1, timeLimitSec);
  const speedRatio = timeTaken / safeTimeLimit;

  let speedBonus = 0;
  if (speedRatio <= 0.5) {
    speedBonus = Math.round(basePoints * 0.25);
  } else if (speedRatio <= 0.75) {
    speedBonus = Math.round(basePoints * 0.15);
  } else if (speedRatio <= 1) {
    speedBonus = Math.round(basePoints * 0.05);
  }

  let accuracyBonus = 0;
  if (accuracy >= 95) {
    accuracyBonus = 30;
  } else if (accuracy >= 85) {
    accuracyBonus = 18;
  } else if (accuracy >= 75) {
    accuracyBonus = 10;
  }

  const perfectRunBonus = wrongAnswers === 0 && totalQuestions > 0 ? 15 : 0;
  const bonusPoints = speedBonus + accuracyBonus + perfectRunBonus;
  const totalPoints = basePoints + bonusPoints;
  const averageTimePerQuestion = totalQuestions
    ? Number((timeTaken / totalQuestions).toFixed(2))
    : 0;

  return {
    score: basePoints,
    totalPoints,
    bonusPoints,
    accuracy,
    correctAnswers,
    wrongAnswers,
    averageTimePerQuestion,
    breakdown: {
      basePoints,
      speedBonus,
      accuracyBonus,
      perfectRunBonus,
    },
  };
}

module.exports = {
  calculateQuizScoring,
};
