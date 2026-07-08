function buildShareUrls(text) {
  const encoded = encodeURIComponent(text);
  return {
    whatsapp: `https://wa.me/?text=${encoded}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://smartquiz.ai')}&summary=${encoded}`,
    twitter: `https://twitter.com/intent/tweet?text=${encoded}`,
    instagram: 'https://www.instagram.com/',
  };
}

function generateSharePayload({ type, user, meta }) {
  if (type === 'achievement') {
    const text = `I just unlocked ${meta.title} on SmartQuiz AI and earned ${meta.xpReward} XP.`;
    return {
      title: 'Achievement Unlocked',
      text,
      cardType: 'achievement',
      meta,
      urls: buildShareUrls(text),
    };
  }

  if (type === 'profile') {
    const rankText = meta.globalRank ? ` Current rank: #${meta.globalRank}.` : '';
    const text = `${user.name} is Level ${user.currentLevel} on SmartQuiz AI with ${user.xpPoints} XP and a ${user.streakCount}-day streak.${rankText}`;
    return {
      title: 'My SmartQuiz Profile',
      text,
      cardType: 'profile',
      meta,
      urls: buildShareUrls(text),
    };
  }

  const text = `I scored ${meta.totalPoints} points with ${meta.accuracy}% accuracy on SmartQuiz AI (${meta.category} - ${meta.difficulty}).`;
  const rankingHighlight = meta.rank ? `Current global rank: #${meta.rank}.` : 'Climbing the leaderboard every day.';
  const finalText = `${text} ${rankingHighlight}`.trim();
  return {
    title: 'Quiz Score Card',
    text: finalText,
    cardType: 'score',
    meta,
    urls: buildShareUrls(finalText),
  };
}

module.exports = {
  generateSharePayload,
};
