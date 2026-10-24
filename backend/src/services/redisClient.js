const { createClient } = require('redis');

let client = null;
let isConnected = false;
let stats = { hits: 0, misses: 0 };

// High-fidelity in-memory Redis store fallback for local standalone operation if external redis server is absent
const memoryStore = new Map();
const memoryExpiry = new Map();

async function initRedis() {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 2000,
        reconnectStrategy: (retries) => {
          if (retries > 1) {
            return new Error('Redis connection aborted, fallback active');
          }
          return 500;
        }
      }
    });

    client.on('error', (err) => {
      if (!isConnected) {
        console.warn(`[Redis] Connection warning: ${err.message}. Emulated Redis engine active.`);
      }
    });

    client.on('connect', () => {
      isConnected = true;
      console.log(`[Redis] Connected successfully to Redis server at ${redisUrl}`);
    });

    await client.connect();
    isConnected = true;
  } catch (err) {
    isConnected = false;
    console.log(`[Redis] External Redis server not reached at ${redisUrl}. In-process Redis caching engine initialized.`);
  }
}

function checkMemoryExpiry(key) {
  if (memoryExpiry.has(key)) {
    const expireAt = memoryExpiry.get(key);
    if (Date.now() > expireAt) {
      memoryStore.delete(key);
      memoryExpiry.delete(key);
      return null;
    }
  }
  return memoryStore.get(key) || null;
}

async function get(key) {
  try {
    let val = null;
    if (isConnected && client) {
      val = await client.get(key);
    } else {
      val = checkMemoryExpiry(key);
    }

    if (val !== null && val !== undefined) {
      stats.hits++;
      console.log(`\x1b[32m[REDIS CACHE HIT]\x1b[0m Key: ${key}`);
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    } else {
      stats.misses++;
      console.log(`\x1b[33m[REDIS CACHE MISS]\x1b[0m Key: ${key}`);
      return null;
    }
  } catch (err) {
    console.error(`[Redis] Error getting key ${key}:`, err.message);
    stats.misses++;
    return null;
  }
}

async function set(key, value, ttlSeconds = 3600) {
  const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
  try {
    if (isConnected && client) {
      await client.set(key, serialized, { EX: ttlSeconds });
    } else {
      memoryStore.set(key, serialized);
      if (ttlSeconds) {
        memoryExpiry.set(key, Date.now() + ttlSeconds * 1000);
      }
    }
    console.log(`\x1b[36m[REDIS SET]\x1b[0m Key: ${key} (TTL: ${ttlSeconds}s)`);
    return true;
  } catch (err) {
    console.error(`[Redis] Error setting key ${key}:`, err.message);
    memoryStore.set(key, serialized);
    return false;
  }
}

async function del(key) {
  try {
    if (isConnected && client) {
      await client.del(key);
    }
    memoryStore.delete(key);
    memoryExpiry.delete(key);
    console.log(`\x1b[35m[REDIS DEL]\x1b[0m Key: ${key}`);
    return true;
  } catch (err) {
    console.error(`[Redis] Error deleting key ${key}:`, err.message);
    return false;
  }
}

async function keys(pattern = '*') {
  try {
    if (isConnected && client) {
      return await client.keys(pattern);
    }
    const now = Date.now();
    const activeKeys = [];
    for (const [k, exp] of memoryExpiry.entries()) {
      if (exp && now > exp) {
        memoryStore.delete(k);
        memoryExpiry.delete(k);
      }
    }
    for (const k of memoryStore.keys()) {
      activeKeys.push(k);
    }
    return activeKeys;
  } catch (err) {
    return Array.from(memoryStore.keys());
  }
}

async function flushAll() {
  try {
    if (isConnected && client) {
      await client.flushAll();
    }
    memoryStore.clear();
    memoryExpiry.clear();
    stats = { hits: 0, misses: 0 };
    console.log('\x1b[35m[REDIS FLUSHALL]\x1b[0m Cache cleared');
    return true;
  } catch (err) {
    return false;
  }
}

async function getStats() {
  const allKeys = await keys('*');
  const details = [];
  const now = Date.now();

  for (const k of allKeys) {
    let ttl = 0;
    if (isConnected && client) {
      ttl = await client.ttl(k);
    } else if (memoryExpiry.has(k)) {
      ttl = Math.max(0, Math.round((memoryExpiry.get(k) - now) / 1000));
    }
    details.push({ key: k, ttlRemaining: ttl });
  }

  const totalReqs = stats.hits + stats.misses;
  const hitRatio = totalReqs > 0 ? ((stats.hits / totalReqs) * 100).toFixed(1) : 0;

  return {
    mode: isConnected ? 'Connected (Redis Server)' : 'In-Process Redis Engine (Standalone)',
    connected: isConnected,
    hits: stats.hits,
    misses: stats.misses,
    totalRequests: totalReqs,
    hitRatio: `${hitRatio}%`,
    keyCount: allKeys.length,
    keys: details
  };
}

module.exports = {
  initRedis,
  get,
  set,
  del,
  keys,
  flushAll,
  getStats
};
