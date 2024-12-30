const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

const cacheMiddleware = (duration) => async (req, res, next) => {
  const key = `__express__${req.originalUrl}`;
  const cached = await redis.get(key);

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  res.sendResponse = res.json;
  res.json = (body) => {
    redis.setex(key, duration, JSON.stringify(body));
    res.sendResponse(body);
  };
  next();
};

module.exports = cacheMiddleware;
