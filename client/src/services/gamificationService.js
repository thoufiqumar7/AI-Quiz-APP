import api from './api';

export async function fetchRecommendations() {
  const { data } = await api.get('/recommendations');
  return data.recommendations;
}

export async function fetchDailyChallenge() {
  const { data } = await api.get('/challenges/daily');
  return data.challenge;
}

export async function completeDailyChallenge(challengeId) {
  const { data } = await api.post('/challenges/complete', { challengeId });
  return data.result;
}

export async function fetchAchievements() {
  const { data } = await api.get('/achievements');
  return data.achievements;
}

export async function fetchGamificationProfile() {
  const { data } = await api.get('/profile/gamification');
  return data.profile;
}

export async function generateSharePayload(payload) {
  const { data } = await api.post('/share/generate', payload);
  return data.share;
}
