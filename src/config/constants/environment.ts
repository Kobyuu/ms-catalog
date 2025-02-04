export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 4001,
  RETRY_LIMIT: 3,
  REDIS: {
    URL: process.env.REDIS_URL || 'redis://redis:6379', 
    HOST: process.env.REDIS_HOST || 'redis',
    PORT: Number(process.env.REDIS_PORT) || 6379,
    CACHE_EXPIRY: Number(process.env.REDIS_CACHE_EXPIRY) || 3600,
    RETRY_DELAY: Number(process.env.REDIS_RETRY_DELAY) || 1000
  }
};