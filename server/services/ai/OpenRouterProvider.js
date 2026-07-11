const axios = require('axios');
const AIProvider = require('./AIProvider');
const ResponseFormatter = require('./ResponseFormatter');
const modelSelector = require('./ModelSelector');
const circuitBreaker = require('./CircuitBreaker');
const RetryManager = require('./RetryManager');
const logger = require('../../config/logger');

class OpenRouterProvider extends AIProvider {
  constructor() {
    super('openrouter');
    this.baseURL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.timeout = parseInt(process.env.OPENROUTER_TIMEOUT, 10) || 30000;
  }

  async generateText(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured.");
    }

    const model = modelSelector.getNextHealthyModel();
    if (!model) {
      throw new Error("No healthy OpenRouter models available.");
    }

    const startTime = Date.now();

    try {
      const response = await RetryManager.execute(async () => {
        return await axios.post(
          `${this.baseURL}/chat/completions`,
          {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || null,
            stream: false
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'HTTP-Referer': process.env.CLIENT_ORIGIN || 'http://localhost:5173',
              'X-Title': 'SmartQuiz AI',
              'Content-Type': 'application/json'
            },
            timeout: this.timeout
          }
        );
      });

      circuitBreaker.recordSuccess(model);
      const latency = Date.now() - startTime;
      
      const data = response.data;
      const text = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
      
      const usage = data.usage ? {
        totalTokens: data.usage.total_tokens,
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens
      } : {};

      return ResponseFormatter.success({
        provider: this.name,
        model: model,
        data: text,
        usage,
        latency,
        source: 'cloud'
      });

    } catch (error) {
      circuitBreaker.recordFailure(model);
      logger.error(`OpenRouter Error on model ${model}:`, error.message);
      
      // If we failed after all retries, throw so the Gateway can fallback
      throw new Error(`OpenRouter failed using model ${model}: ${error.message}`);
    }
  }

  async generateStream(prompt, options = {}, onChunk) {
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured.");
    }

    const model = modelSelector.getNextHealthyModel();
    if (!model) {
      throw new Error("No healthy OpenRouter models available.");
    }

    const startTime = Date.now();
    let accumulatedText = "";

    try {
      await RetryManager.execute(async () => {
        const response = await axios.post(
          `${this.baseURL}/chat/completions`,
          {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: options.temperature || 0.7,
            stream: true
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'HTTP-Referer': process.env.CLIENT_ORIGIN || 'http://localhost:5173',
              'X-Title': 'SmartQuiz AI',
              'Content-Type': 'application/json'
            },
            responseType: 'stream',
            timeout: this.timeout
          }
        );

        return new Promise((resolve, reject) => {
          response.data.on('data', chunk => {
            const lines = chunk.toString().split('\\n').filter(line => line.trim() !== '');
            for (const line of lines) {
              if (line.includes('[DONE]')) return resolve();
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.replace('data: ', ''));
                  if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                    const text = data.choices[0].delta.content;
                    accumulatedText += text;
                    onChunk(text);
                  }
                } catch (err) {
                  // Ignore parse errors on partial chunks
                }
              }
            }
          });
          response.data.on('end', () => resolve());
          response.data.on('error', err => reject(err));
        });
      });

      circuitBreaker.recordSuccess(model);
      const latency = Date.now() - startTime;

      // Streams don't always give token usage. Estimate if not provided.
      return ResponseFormatter.success({
        provider: this.name,
        model: model,
        data: accumulatedText,
        latency,
        source: 'cloud'
      });
    } catch (error) {
      circuitBreaker.recordFailure(model);
      logger.error(`OpenRouter Streaming Error on model ${model}:`, error.message);
      throw new Error(`OpenRouter streaming failed using model ${model}: ${error.message}`);
    }
  }
}

module.exports = new OpenRouterProvider();
