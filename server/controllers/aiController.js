const ProviderFactory = require('../services/ai/ProviderFactory');
const PromptTemplates = require('../services/ai/PromptTemplates');
const UsageTracker = require('../services/ai/UsageTracker');
const modelSelector = require('../services/ai/ModelSelector');
const cacheProvider = require('../services/ai/CacheFactory');
const crypto = require('crypto');
const env = require('../config/env');

// Helper to generate SHA-256 cache key
const getCacheKey = (prefix, prompt) => {
  const hash = crypto.createHash('sha256').update(prompt).digest('hex');
  return `${prefix}:${hash}`;
};

exports.chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    
    // Construct prompt with history context
    const context = history ? history.map(h => `${h.role}: ${h.content}`).join('\n') : '';
    const prompt = `${PromptTemplates.CHAT_SYSTEM}\n\nContext:\n${context}\n\nUser: ${message}\nSmartQuiz AI:`;

    // SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    await ProviderFactory.generateStreamWithFallback(prompt, { temperature: 0.7 }, (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      next(error);
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
};

exports.generateQuiz = async (req, res, next) => {
  try {
    const { topic, difficulty, count } = req.body;
    const prompt = PromptTemplates.QUIZ_GENERATION(topic, difficulty, count);
    const cacheKey = getCacheKey('quiz', prompt);

    const cachedData = await cacheProvider.get(cacheKey);
    if (cachedData) {
      UsageTracker.trackRequest('cache', 'memory', { success: true, cached: true });
      return res.json({ ...cachedData, cached: true });
    }
    
    const response = await ProviderFactory.generateWithFallback(prompt, { temperature: 0.6 });
    
    // Safely parse JSON in case it has markdown ticks
    let parsedData = response.data;
    try {
      const cleanJson = response.data.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
      response.data = parsedData;
    } catch (e) {
      // If parsing fails, just return raw string or throw
    }
    
    await cacheProvider.set(cacheKey, response, env.cacheTtl);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.explain = async (req, res, next) => {
  try {
    const { question, selectedAnswer, correctAnswer, isCorrect } = req.body;
    const prompt = PromptTemplates.EXPLANATION(question, selectedAnswer, correctAnswer, isCorrect);
    const cacheKey = getCacheKey('explain', prompt);

    const cachedData = await cacheProvider.get(cacheKey);
    if (cachedData) {
      UsageTracker.trackRequest('cache', 'memory', { success: true, cached: true });
      return res.json({ ...cachedData, cached: true });
    }
    
    const response = await ProviderFactory.generateWithFallback(prompt, { temperature: 0.4 });
    await cacheProvider.set(cacheKey, response, env.cacheTtl);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.recommend = async (req, res, next) => {
  try {
    const { weakTopics, strongTopics } = req.body;
    const prompt = PromptTemplates.RECOMMENDATION(weakTopics, strongTopics);
    const cacheKey = getCacheKey('recommend', prompt);

    const cachedData = await cacheProvider.get(cacheKey);
    if (cachedData) {
      UsageTracker.trackRequest('cache', 'memory', { success: true, cached: true });
      return res.json({ ...cachedData, cached: true });
    }
    
    const response = await ProviderFactory.generateWithFallback(prompt, { temperature: 0.5 });
    
    try {
      const cleanJson = response.data.replace(/```json/gi, '').replace(/```/g, '').trim();
      response.data = JSON.parse(cleanJson);
    } catch (e) {}

    await cacheProvider.set(cacheKey, response, env.cacheTtl);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.getStatus = (req, res) => {
  const metrics = UsageTracker.getCurrentMetrics();
  const models = modelSelector.getModelStatuses();
  
  res.json({
    success: true,
    data: {
      metrics,
      models,
      activeProvider: process.env.AI_PRIMARY_PROVIDER || 'openrouter'
    }
  });
};
