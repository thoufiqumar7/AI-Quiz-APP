const circuitBreaker = require('./CircuitBreaker');

/**
 * Manages OpenRouter models, enabling Round Robin and Health-based selection.
 */
class ModelSelector {
  constructor() {
    // Default models based on priority
    this.models = [
      'meta-llama/llama-3.3-70b-instruct:free',
      'deepseek/deepseek-r1:free',
      'mistralai/mistral-small-3.2-24b-instruct:free',
      'google/gemma-3-27b-it:free',
      'qwen/qwen3-coder:free'
    ];
    this.currentIndex = 0;
  }

  /**
   * Get the next healthy model.
   * If all models are unhealthy, returns null.
   */
  getNextHealthyModel() {
    const startIndex = this.currentIndex;
    
    do {
      const model = this.models[this.currentIndex];
      
      // Advance the index for the next call (Round Robin)
      this.currentIndex = (this.currentIndex + 1) % this.models.length;
      
      if (circuitBreaker.isHealthy(model)) {
        return model;
      }
    } while (this.currentIndex !== startIndex);

    // If we looped through all and found none healthy
    return null;
  }

  /**
   * Get a list of all configured models and their current health status.
   */
  getModelStatuses() {
    return this.models.map(model => ({
      name: model,
      healthy: circuitBreaker.isHealthy(model)
    }));
  }
}

module.exports = new ModelSelector();
