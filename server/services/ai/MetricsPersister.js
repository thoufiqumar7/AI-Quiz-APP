const AIUsageMetrics = require('../../models/AIUsageMetrics');
const UsageTracker = require('./UsageTracker');
const logger = require('../../config/logger');

class MetricsPersister {
  constructor() {
    this.intervalId = null;
    this.flushIntervalMs = 5 * 60 * 1000; // 5 minutes
  }

  start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.flush(), this.flushIntervalMs);
    logger.info('AI Metrics Persister started.');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async flush() {
    try {
      const metricsMap = UsageTracker.getAndResetMetrics();
      const keys = Object.keys(metricsMap);
      
      if (keys.length === 0) return; // Nothing to persist

      const docsToInsert = keys.map(key => {
        const [provider, model] = key.split(':');
        const m = metricsMap[key];
        const avgLatency = m.requests > 0 ? Math.round(m.totalLatency / m.requests) : 0;

        return {
          timestamp: new Date(),
          provider,
          model,
          requests: m.requests,
          successfulRequests: m.successfulRequests,
          failedRequests: m.failedRequests,
          averageLatency: avgLatency,
          totalTokens: m.totalTokens,
          promptTokens: m.promptTokens,
          completionTokens: m.completionTokens,
          cacheHits: m.cacheHits,
          cacheMisses: m.cacheMisses,
          retryCount: m.retryCount,
          fallbackCount: m.fallbackCount,
          offlineResponseCount: m.offlineResponseCount
        };
      });

      await AIUsageMetrics.insertMany(docsToInsert);
      logger.info(`Flushed ${docsToInsert.length} AI metric records to DB.`);
    } catch (error) {
      logger.error('Failed to flush AI metrics to DB', { error: error.message });
    }
  }
}

// Singleton
module.exports = new MetricsPersister();
