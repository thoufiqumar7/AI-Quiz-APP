const logger = require('../../config/logger');

/**
 * Tracks failures per model. If a model fails consecutively, trips the breaker
 * to disable it for 5 minutes.
 */
class CircuitBreaker {
  constructor() {
    this.failureCounts = {}; // Key: model -> integer
    this.cooldownUntil = {}; // Key: model -> timestamp (Date.now())
    
    this.FAILURE_THRESHOLD = 3;
    this.COOLDOWN_PERIOD_MS = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Check if the circuit breaker is closed (healthy) for this model.
   * If it's open (tripped) but the cooldown has passed, it resets automatically.
   */
  isHealthy(model) {
    if (this.cooldownUntil[model]) {
      if (Date.now() > this.cooldownUntil[model]) {
        // Cooldown passed, reset state
        this.reset(model);
        return true;
      }
      return false; // Still in cooldown
    }
    return true; // Healthy
  }

  /**
   * Record a failure for a model. Trip breaker if threshold reached.
   */
  recordFailure(model) {
    this.failureCounts[model] = (this.failureCounts[model] || 0) + 1;
    
    if (this.failureCounts[model] >= this.FAILURE_THRESHOLD) {
      this.cooldownUntil[model] = Date.now() + this.COOLDOWN_PERIOD_MS;
      logger.warn(`Circuit Breaker tripped for model: ${model}. Disabled for 5 minutes.`);
    }
  }

  /**
   * Record a success, resetting failure counts.
   */
  recordSuccess(model) {
    this.reset(model);
  }

  /**
   * Manually reset a model's state.
   */
  reset(model) {
    this.failureCounts[model] = 0;
    this.cooldownUntil[model] = 0;
  }
}

module.exports = new CircuitBreaker();
