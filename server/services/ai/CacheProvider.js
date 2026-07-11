/**
 * Abstract Base Class for Cache Providers
 */
class CacheProvider {
  constructor() {
    if (this.constructor === CacheProvider) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  /**
   * Get value from cache
   * @param {string} key 
   * @returns {Promise<any>}
   */
  async get(key) {
    throw new Error("Method 'get()' must be implemented.");
  }

  /**
   * Set value in cache
   * @param {string} key 
   * @param {any} value 
   * @param {number} ttlSeconds 
   * @returns {Promise<void>}
   */
  async set(key, value, ttlSeconds) {
    throw new Error("Method 'set()' must be implemented.");
  }
}

module.exports = CacheProvider;
