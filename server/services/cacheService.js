class MemoryCache {
  constructor() {
    this.entries = new Map();
  }

  get(key) {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlMs = 30_000) {
    this.entries.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  }

  deleteByPrefix(prefix) {
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) this.entries.delete(key);
    }
  }

  clear() {
    this.entries.clear();
  }
}

module.exports = new MemoryCache();
