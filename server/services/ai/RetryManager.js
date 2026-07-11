const logger = require('../../config/logger');

/**
 * Executes a function with exponential backoff retries.
 */
class RetryManager {
  /**
   * Execute with backoff.
   * @param {function} operation - Async function returning a promise.
   * @param {number} maxRetries - Maximum number of retries (default 3).
   * @returns {Promise<any>}
   */
  static async execute(operation, maxRetries = 3) {
    const backoffDelays = [1000, 2000, 4000]; // 1s, 2s, 4s
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        return await operation();
      } catch (error) {
        // Check if error is retryable (429 Rate Limit, 5xx Server Error, network timeout)
        const isRetryable = RetryManager.isRetryableError(error);
        
        if (!isRetryable || attempt === maxRetries) {
          throw error;
        }

        const delay = backoffDelays[attempt] || 4000;
        logger.warn(`Operation failed, retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries}). Error: ${error.message}`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
      }
    }
  }

  static isRetryableError(error) {
    // Determine based on status codes or error messages
    const status = error.status || error.statusCode || error.response?.status;
    
    if (status === 429) return true; // Rate Limited
    if (status >= 500) return true;  // Server Errors
    if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) return true;

    return false;
  }
}

module.exports = RetryManager;
