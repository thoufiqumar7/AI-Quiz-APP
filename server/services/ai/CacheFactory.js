const MemoryCacheProvider = require('./MemoryCacheProvider');

/**
 * Cache Factory to abstract away the caching layer.
 * Will support RedisCacheProvider in the future.
 */
class CacheFactory {
  constructor() {
    const providerStr = process.env.CACHE_PROVIDER || 'memory';
    
    if (providerStr === 'redis') {
      // Future: this.provider = new RedisCacheProvider();
      this.provider = MemoryCacheProvider; // Fallback for now
    } else {
      this.provider = MemoryCacheProvider;
    }
  }

  getProvider() {
    return this.provider;
  }
}

module.exports = new CacheFactory().getProvider();
