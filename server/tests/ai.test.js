const ProviderFactory = require('../services/ai/ProviderFactory');
const OpenRouterProvider = require('../services/ai/OpenRouterProvider');
const GeminiProvider = require('../services/ai/GeminiProvider');
const LocalIntelligenceProvider = require('../services/ai/LocalIntelligenceProvider');
const CircuitBreaker = require('../services/ai/CircuitBreaker');
const ModelSelector = require('../services/ai/ModelSelector');

describe('AI Provider Layer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    CircuitBreaker.failureCounts = {};
    CircuitBreaker.cooldownUntil = {};
  });

  it('CircuitBreaker trips after 3 failures', () => {
    const model = 'test-model';
    expect(CircuitBreaker.isHealthy(model)).toBe(true);

    CircuitBreaker.recordFailure(model);
    CircuitBreaker.recordFailure(model);
    expect(CircuitBreaker.isHealthy(model)).toBe(true); // 2 failures

    CircuitBreaker.recordFailure(model); // 3 failures
    expect(CircuitBreaker.isHealthy(model)).toBe(false); // Tripped
  });

  it('ModelSelector rotates through models', () => {
    const first = ModelSelector.getNextHealthyModel();
    const second = ModelSelector.getNextHealthyModel();
    expect(first).not.toEqual(second);
  });

  it('ProviderFactory falls back sequentially', async () => {
    // Mock primary failure
    jest.spyOn(OpenRouterProvider, 'generateText').mockRejectedValue(new Error('OpenRouter API Down'));
    // Mock secondary failure
    jest.spyOn(GeminiProvider, 'generateText').mockRejectedValue(new Error('Gemini API Down'));
    // Mock local success
    jest.spyOn(LocalIntelligenceProvider, 'generateText').mockResolvedValue({
      success: true,
      provider: 'local',
      data: 'Offline fallback response'
    });

    const response = await ProviderFactory.generateWithFallback('Hello', {});

    expect(OpenRouterProvider.generateText).toHaveBeenCalledTimes(1);
    expect(GeminiProvider.generateText).toHaveBeenCalledTimes(1);
    expect(LocalIntelligenceProvider.generateText).toHaveBeenCalledTimes(1);
    expect(response.provider).toBe('local');
    expect(response.data).toBe('Offline fallback response');
  });
});
