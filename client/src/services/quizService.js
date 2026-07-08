import api from './api';

export async function fetchCategories() {
  const { data } = await api.get('/categories');
  return data.categories;
}

export async function startQuiz(params) {
  const { data } = await api.get('/quiz/start', { params });
  return data.quiz;
}

export async function submitQuiz(payload) {
  const { data } = await api.post('/quiz/submit', payload);
  return data.result;
}

export async function fetchQuizHistory() {
  const { data } = await api.get('/quiz/history');
  return data.history;
}
