import api from './api';

export async function fetchAdminDashboard() {
  const { data } = await api.get('/admin/dashboard');
  return data.dashboard;
}

export async function fetchAdminUsers(params = {}) {
  const { data } = await api.get('/admin/users', { params });
  return data;
}

export async function setUserBlocked(userId, isBlocked) {
  const { data } = await api.put(`/admin/users/${userId}/block`, { isBlocked });
  return data.user;
}

export async function setUserRole(userId, role, rolePermissions = []) {
  const { data } = await api.put(`/admin/users/${userId}/role`, { role, rolePermissions });
  return data.user;
}

export async function deleteAdminUser(userId) {
  const { data } = await api.delete(`/admin/users/${userId}`);
  return data;
}

export async function fetchAdminQuestions(params = {}) {
  const { data } = await api.get('/admin/questions', { params });
  return data;
}

export async function saveQuestion(question) {
  const { _id, ...payload } = question;
  const { data } = _id
    ? await api.put(`/admin/questions/${_id}`, payload)
    : await api.post('/admin/questions', payload);
  return data.question;
}

export async function deleteQuestion(questionId) {
  const { data } = await api.delete(`/admin/questions/${questionId}`);
  return data;
}

export async function fetchAdminCategories() {
  const { data } = await api.get('/admin/categories');
  return data.categories;
}

export async function saveCategory(category) {
  const { _id, ...payload } = category;
  const { data } = _id
    ? await api.put(`/admin/categories/${_id}`, payload)
    : await api.post('/admin/categories', payload);
  return data.category;
}

export async function deleteCategory(categoryId) {
  const { data } = await api.delete(`/admin/categories/${categoryId}`);
  return data;
}

export async function fetchAdminChallenges() {
  const { data } = await api.get('/admin/challenges');
  return data.challenges;
}

export async function saveChallenge(challenge) {
  const { _id, category, ...rest } = challenge;
  const payload = { ...rest, category: category?._id || category };
  const { data } = _id
    ? await api.put(`/admin/challenges/${_id}`, payload)
    : await api.post('/admin/challenges', payload);
  return data.challenge;
}

export async function deleteChallenge(challengeId) {
  const { data } = await api.delete(`/admin/challenges/${challengeId}`);
  return data;
}

export async function fetchAdminAchievements() {
  const { data } = await api.get('/admin/achievements');
  return data.achievements;
}

export async function saveAchievement(achievement) {
  const { _id, ...payload } = achievement;
  const { data } = _id
    ? await api.put(`/admin/achievements/${_id}`, payload)
    : await api.post('/admin/achievements', payload);
  return data.achievement;
}

export async function deleteAchievement(achievementId) {
  const { data } = await api.delete(`/admin/achievements/${achievementId}`);
  return data;
}
