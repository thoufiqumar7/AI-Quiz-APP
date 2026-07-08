import api from './api';

export async function registerUser(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function loginUser(payload) {
  const { data } = await api.post('/auth/login', payload);
  return data;
}

export async function getProfile() {
  const { data } = await api.get('/auth/profile');
  return data;
}

export async function refreshSession() {
  const { data } = await api.post('/auth/refresh');
  return data;
}

export async function logoutSession() {
  const { data } = await api.post('/auth/logout');
  return data;
}

export async function logoutAllSessions() {
  const { data } = await api.post('/auth/logout-all');
  return data;
}

export async function fetchSessions() {
  const { data } = await api.get('/auth/sessions');
  return data.sessions;
}

export async function revokeSession(sessionId) {
  const { data } = await api.delete(`/auth/sessions/${sessionId}`);
  return data;
}
