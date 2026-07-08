import api from './api';

export async function fetchAnalyticsDashboard() {
  const { data } = await api.get('/analytics/dashboard');
  return data.dashboard;
}

export async function fetchAnalyticsPerformance() {
  const { data } = await api.get('/analytics/performance');
  return data.performance;
}

export async function fetchAnalyticsHistory() {
  const { data } = await api.get('/analytics/history');
  return data.history;
}

export async function fetchAnalyticsTopics(params = {}) {
  const { data } = await api.get('/analytics/topics', { params });
  return data.topics;
}
