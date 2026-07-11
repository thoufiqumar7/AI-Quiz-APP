const CacheProvider = require('./CacheProvider');

/**
 * In-Memory Cache Provider implementation using Map.
 * Suitable for single-instance deployments.
 */
class MemoryCacheProvider extends CacheProvider {
  constructor() {
    super();
    this.cache = new Map();
  }

  async get(key) {
    const record = this.cache.get(key);
    if (!record) return null;

    if (Date.now() > record.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return record.value;
  }

  async set(key, value, ttlSeconds) {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiresAt });
    
    // Lazy cleanup of old keys randomly to prevent unbound memory growth
    if (this.cache.size > 1000) {
      const now = Date.now();
      for (const [k, v] of this.cache.entries()) {
        if (now > v.expiresAt) {
          this.cache.delete(k);
        }
      }
    }
  }
}

module.exports = new MemoryCacheProvider();
