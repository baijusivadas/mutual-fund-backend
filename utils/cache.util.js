const NodeCache = require("node-cache");

// Default TTL of 10 minutes (600 seconds)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const getCache = (key) => {
  return cache.get(key);
};

const setCache = (key, value, ttl) => {
  return cache.set(key, value, ttl);
};

const delCache = (key) => {
  return cache.del(key);
};

const flushCache = () => {
  return cache.flushAll();
};

module.exports = {
  getCache,
  setCache,
  delCache,
  flushCache,
  cache,
};
