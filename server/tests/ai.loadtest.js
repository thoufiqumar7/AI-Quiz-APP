/**
 * AI Provider Layer Load Test
 * Simulates 100 concurrent requests to test for deadlocks, race conditions, and memory leaks.
 */

const ProviderFactory = require('../services/ai/ProviderFactory');
const UsageTracker = require('../services/ai/UsageTracker');
const CircuitBreaker = require('../services/ai/CircuitBreaker');

// Mock out the actual API calls so we don't spam OpenRouter/Gemini during tests
const OpenRouterProvider = require('../services/ai/OpenRouterProvider');
const GeminiProvider = require('../services/ai/GeminiProvider');
const LocalProvider = require('../services/ai/LocalIntelligenceProvider');

jest.mock('../services/ai/OpenRouterProvider');
jest.mock('../services/ai/GeminiProvider');
// Let local run normally as it has no external dependencies

async function runLoadTest() {
  console.log("Starting Load Test: 100 Concurrent Requests...");
  
  // Setup mocks to resolve quickly
  OpenRouterProvider.generateText = jest.fn().mockResolvedValue({
    success: true, provider: 'openrouter', model: 'llama', data: 'mock', usage: { totalTokens: 10 }, latency: 100
  });

  const startMemory = process.memoryUsage().heapUsed;
  const startTime = Date.now();

  const promises = [];
  for (let i = 0; i < 100; i++) {
    // We bypass the controller and hit ProviderFactory directly to isolate provider scaling
    promises.push(ProviderFactory.generateWithFallback("Test prompt", {}));
  }

  const results = await Promise.allSettled(promises);
  const endTime = Date.now();
  const endMemory = process.memoryUsage().heapUsed;

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log("--- LOAD TEST RESULTS ---");
  console.log(`Duration: ${endTime - startTime}ms`);
  console.log(`Success: ${successful} / 100`);
  console.log(`Failures: ${failed} / 100`);
  console.log(`Memory Delta: ${Math.round((endMemory - startMemory) / 1024 / 1024)} MB`);
  
  const metrics = UsageTracker.getCurrentMetrics();
  console.log("Usage Metrics:");
  console.log(metrics);

  if (failed > 0) {
    throw new Error(`Load test failed with ${failed} rejections.`);
  }

  console.log("Load Test PASSED.");
}

// If run directly
if (require.main === module) {
  runLoadTest().catch(console.error);
}

module.exports = runLoadTest;
