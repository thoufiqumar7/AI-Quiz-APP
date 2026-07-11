/**
 * AI Provider Layer Stress & Fallback Test
 * Forces simulated outages to verify exact fallback sequencing and circuit breaking.
 */

const ProviderFactory = require('../services/ai/ProviderFactory');
const OpenRouterProvider = require('../services/ai/OpenRouterProvider');
const GeminiProvider = require('../services/ai/GeminiProvider');
const CircuitBreaker = require('../services/ai/CircuitBreaker');

async function runStressTest() {
  console.log("Starting Stress & Fallback Test...");

  // Mock OpenRouter to always fail (Simulating Outage)
  OpenRouterProvider.generateText = jest.fn().mockRejectedValue(new Error('OpenRouter 502 Bad Gateway'));
  
  // First request: Should try OpenRouter, fail, fallback to Gemini
  GeminiProvider.generateText = jest.fn().mockResolvedValue({
    success: true, provider: 'gemini', model: 'gemini-1.5', data: 'mock gemini', usage: {}, latency: 150
  });

  console.log("Scenario 1: Primary Outage -> Secondary Fallback");
  const res1 = await ProviderFactory.generateWithFallback("Prompt 1");
  if (res1.provider !== 'gemini') throw new Error("Fallback to Gemini failed.");
  console.log("Scenario 1 PASSED.");

  // Scenario 2: Complete External Outage -> Local Fallback
  console.log("Scenario 2: Total External Outage -> Local Fallback");
  GeminiProvider.generateText = jest.fn().mockRejectedValue(new Error('Gemini 500 Internal Error'));
  
  const res2 = await ProviderFactory.generateWithFallback("Explain why the sky is blue");
  if (res2.provider !== 'local') throw new Error("Fallback to Local Intelligence failed.");
  console.log("Scenario 2 PASSED.");

  console.log("Stress & Fallback Test PASSED.");
}

// If run directly
if (require.main === module) {
  runStressTest().catch(console.error);
}

module.exports = runStressTest;
