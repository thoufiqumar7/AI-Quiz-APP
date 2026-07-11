import api from './api';

const aiService = {
  getStatus: () => api.get('/ai/status').then(res => res.data),
  generateQuiz: (data) => api.post('/ai/generate-quiz', data).then(res => res.data),
  explain: (data) => api.post('/ai/explain', data).then(res => res.data),
  recommend: (data) => api.post('/ai/recommend', data).then(res => res.data)
};

export default aiService;
