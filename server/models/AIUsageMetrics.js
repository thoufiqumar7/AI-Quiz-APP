const mongoose = require('mongoose');

const AIUsageMetricsSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    index: true,
    expires: '30d' // 30 days retention
  },
  provider: {
    type: String,
    required: true,
    enum: ['openrouter', 'gemini', 'local']
  },
  model: {
    type: String,
    required: true
  },
  requests: { type: Number, default: 0 },
  successfulRequests: { type: Number, default: 0 },
  failedRequests: { type: Number, default: 0 },
  averageLatency: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  promptTokens: { type: Number, default: 0 },
  completionTokens: { type: Number, default: 0 },
  cacheHits: { type: Number, default: 0 },
  cacheMisses: { type: Number, default: 0 },
  retryCount: { type: Number, default: 0 },
  fallbackCount: { type: Number, default: 0 },
  offlineResponseCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Compound index for quick querying by provider/model over time
AIUsageMetricsSchema.index({ provider: 1, model: 1, timestamp: -1 });

module.exports = mongoose.model('AIUsageMetrics', AIUsageMetricsSchema);
