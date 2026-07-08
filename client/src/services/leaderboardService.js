import api from './api';

export async function fetchGlobalLeaderboard(params = {}) {
  const { data } = await api.get('/leaderboard/global', { params });
  return data;
}

export async function fetchWeeklyLeaderboard(params = {}) {
  const { data } = await api.get('/leaderboard/weekly', { params });
  return data;
}

export async function fetchMonthlyLeaderboard(params = {}) {
  const { data } = await api.get('/leaderboard/monthly', { params });
  return data;
}
