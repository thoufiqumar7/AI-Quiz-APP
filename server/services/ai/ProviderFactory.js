const openRouterProvider = require('./OpenRouterProvider');
const geminiProvider = require('./GeminiProvider');
const localProvider = require('./LocalIntelligenceProvider');
const logger = require('../../config/logger');
const usageTracker = require('./UsageTracker');

/**
 * AI Gateway orchestrator.
 * Handles the priority fallback logic: OpenRouter -> Gemini -> Local
 */
class ProviderFactory {
  constructor() {
    this.primary = process.env.AI_PRIMARY_PROVIDER || 'openrouter';
    this.fallback = process.env.AI_FALLBACK_PROVIDER || 'gemini';
  }

  /**
   * Executes a text generation request, cascading through providers on failure.
   */
  async generateWithFallback(prompt, options = {}) {
    let lastError = null;

    // 1. Try Primary (OpenRouter)
    try {
      if (this.primary === 'openrouter') {
        const response = await openRouterProvider.generateText(prompt, options);
        usageTracker.trackRequest('openrouter', response.model, { ...response });
        return response;
      }
    } catch (error) {
      lastError = error;
      logger.warn(`Primary provider (OpenRouter) failed: ${error.message}. Attempting fallback...`);
    }

    // 2. Try Secondary (Gemini)
    try {
      const response = await geminiProvider.generateText(prompt, options);
      usageTracker.trackRequest('gemini', response.model, { ...response, fallback: true });
      return response;
    } catch (error) {
      lastError = error;
      logger.warn(`Secondary provider (Gemini) failed: ${error.message}. Attempting local offline fallback...`);
    }

    // 3. Try Tertiary (Local Intelligence Engine)
    try {
      const response = await localProvider.generateText(prompt, options);
      usageTracker.trackRequest('local', response.model, { ...response, fallback: true, offline: true });
      return response;
    } catch (error) {
      logger.error(`ALL AI PROVIDERS FAILED (Including Local). Final error: ${error.message}`);
      throw new Error("AI services are currently completely unavailable.");
    }
  }

  /**
   * Executes a streaming request, cascading streaming capability, then blocking capability, then local.
   */
  async generateStreamWithFallback(prompt, options = {}, onChunk) {
    // Streaming Fallback Priority:
    // 1. OpenRouter Stream
    // 2. OpenRouter Block (if stream fails early)
    // 3. Gemini Stream
    // 4. Gemini Block
    // 5. Local Engine
    
    try {
      const response = await openRouterProvider.generateStream(prompt, options, onChunk);
      usageTracker.trackRequest('openrouter', response.model, { ...response });
      return response;
    } catch (error) {
      logger.warn(`OpenRouter Streaming failed: ${error.message}. Falling back to OpenRouter blocking...`);
    }

    try {
      // simulate streaming from blocking response
      const response = await openRouterProvider.generateText(prompt, options);
      onChunk(response.data);
      usageTracker.trackRequest('openrouter', response.model, { ...response, fallback: true });
      return response;
    } catch (error) {
      logger.warn(`OpenRouter Blocking failed: ${error.message}. Falling back to Gemini Streaming...`);
    }

    try {
      const response = await geminiProvider.generateStream(prompt, options, onChunk);
      usageTracker.trackRequest('gemini', response.model, { ...response, fallback: true });
      return response;
    } catch (error) {
      logger.warn(`Gemini Streaming failed: ${error.message}. Falling back to Gemini blocking...`);
    }

    try {
      const response = await geminiProvider.generateText(prompt, options);
      onChunk(response.data);
      usageTracker.trackRequest('gemini', response.model, { ...response, fallback: true });
      return response;
    } catch (error) {
      logger.warn(`Gemini Blocking failed: ${error.message}. Falling back to Local Intelligence Engine...`);
    }

    try {
      const response = await localProvider.generateStream(prompt, options, onChunk);
      usageTracker.trackRequest('local', response.model, { ...response, fallback: true, offline: true });
      return response;
    } catch (error) {
      logger.error(`ALL AI PROVIDERS FAILED for stream.`);
      throw new Error("AI services are completely unavailable.");
    }
  }
}

module.exports = new ProviderFactory();
