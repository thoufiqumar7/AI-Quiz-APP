class UsageTracker {
  constructor() {
    this.metrics = {}; // Key: "provider:model"
  }

  _getKey(provider, model) {
    return `${provider}:${model}`;
  }

  _initializeKey(key) {
    if (!this.metrics[key]) {
      this.metrics[key] = {
        requests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalLatency: 0,
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        cacheHits: 0,
        cacheMisses: 0,
        retryCount: 0,
        fallbackCount: 0,
        offlineResponseCount: 0
      };
    }
  }

  trackRequest(provider, model, {
    success = true,
    latency = 0,
    usage = { totalTokens: 0, promptTokens: 0, completionTokens: 0 },
    cached = false,
    retries = 0,
    fallback = false,
    offline = false
  }) {
    const key = this._getKey(provider, model);
    this._initializeKey(key);

    const m = this.metrics[key];
    m.requests += 1;
    if (success) {
      m.successfulRequests += 1;
    } else {
      m.failedRequests += 1;
    }
    
    m.totalLatency += latency;
    
    m.totalTokens += (usage.totalTokens || 0);
    m.promptTokens += (usage.promptTokens || 0);
    m.completionTokens += (usage.completionTokens || 0);

    if (cached) m.cacheHits += 1;
    else m.cacheMisses += 1;

    m.retryCount += retries;
    if (fallback) m.fallbackCount += 1;
    if (offline) m.offlineResponseCount += 1;
  }

  getAndResetMetrics() {
    const currentMetrics = { ...this.metrics };
    this.metrics = {}; // Reset for the next window
    return currentMetrics;
  }

  getCurrentMetrics() {
    return this.metrics;
  }
}

// Singleton instance
module.exports = new UsageTracker();
