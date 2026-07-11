/**
 * Abstract Base Class for AI Providers
 * All AI providers (OpenRouter, Gemini, Local) must implement these methods.
 */
class AIProvider {
  constructor(name) {
    if (this.constructor === AIProvider) {
      throw new Error("Abstract classes can't be instantiated.");
    }
    this.name = name;
  }

  /**
   * Get the name of the provider.
   * @returns {string} provider name
   */
  getName() {
    return this.name;
  }

  /**
   * Generate text response from a prompt.
   * @param {string} prompt - The compiled prompt string.
   * @param {object} options - Options (temperature, maxTokens, model).
   * @returns {Promise<object>} Standardized response object (success, model, data, usage, latency).
   */
  async generateText(prompt, options = {}) {
    throw new Error("Method 'generateText()' must be implemented.");
  }

  /**
   * Generate streaming response.
   * @param {string} prompt - The compiled prompt string.
   * @param {object} options - Options.
   * @param {function} onChunk - Callback executed on each stream chunk.
   * @returns {Promise<object>} Standardized summary object when stream completes.
   */
  async generateStream(prompt, options = {}, onChunk) {
    throw new Error("Method 'generateStream()' must be implemented.");
  }
}

module.exports = AIProvider;
