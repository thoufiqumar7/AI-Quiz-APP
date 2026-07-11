const { GoogleGenerativeAI } = require('@google/genai');
const AIProvider = require('./AIProvider');
const ResponseFormatter = require('./ResponseFormatter');
const RetryManager = require('./RetryManager');
const logger = require('../../config/logger');

// Note: Using the legacy '@google/genai' assuming it maps to standard usage, 
// though typically it is '@google/generative-ai'. Let's use the standard fetch-based approach for zero-dependency if needed, 
// or standard axios call to Gemini API to avoid dependency issues.

const axios = require('axios');

class GeminiProvider extends AIProvider {
  constructor() {
    super('gemini');
    this.apiKey = process.env.GEMINI_API_KEY;
    this.modelName = 'gemini-2.5-flash';
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  async generateText(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const startTime = Date.now();
    const url = `${this.baseURL}/${this.modelName}:generateContent?key=${this.apiKey}`;

    try {
      const response = await RetryManager.execute(async () => {
        return await axios.post(
          url,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: options.temperature || 0.7,
              maxOutputTokens: options.maxTokens || 2048,
            }
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
          }
        );
      });

      const latency = Date.now() - startTime;
      const data = response.data;
      
      let text = '';
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        text = data.candidates[0].content.parts[0].text;
      }

      const usage = data.usageMetadata ? {
        totalTokens: data.usageMetadata.totalTokenCount,
        promptTokens: data.usageMetadata.promptTokenCount,
        completionTokens: data.usageMetadata.candidatesTokenCount
      } : {};

      return ResponseFormatter.success({
        provider: this.name,
        model: this.modelName,
        data: text,
        usage,
        latency,
        source: 'cloud'
      });

    } catch (error) {
      logger.error('Gemini Error:', error.message);
      throw new Error(`Gemini failed: ${error.message}`);
    }
  }

  async generateStream(prompt, options = {}, onChunk) {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const startTime = Date.now();
    const url = `${this.baseURL}/${this.modelName}:streamGenerateContent?alt=sse&key=${this.apiKey}`;
    let accumulatedText = "";

    try {
      await RetryManager.execute(async () => {
        const response = await axios.post(
          url,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: options.temperature || 0.7
            }
          },
          {
            headers: { 'Content-Type': 'application/json' },
            responseType: 'stream',
            timeout: 30000
          }
        );

        return new Promise((resolve, reject) => {
          response.data.on('data', chunk => {
            const lines = chunk.toString().split('\\n').filter(line => line.trim() !== '');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.replace('data: ', ''));
                  if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                    const text = data.candidates[0].content.parts[0].text;
                    accumulatedText += text;
                    onChunk(text);
                  }
                } catch (err) {
                  // ignore
                }
              }
            }
          });
          response.data.on('end', () => resolve());
          response.data.on('error', err => reject(err));
        });
      });

      const latency = Date.now() - startTime;
      return ResponseFormatter.success({
        provider: this.name,
        model: this.modelName,
        data: accumulatedText,
        latency,
        source: 'cloud'
      });
    } catch (error) {
      logger.error('Gemini Streaming Error:', error.message);
      throw new Error(`Gemini streaming failed: ${error.message}`);
    }
  }
}

module.exports = new GeminiProvider();
