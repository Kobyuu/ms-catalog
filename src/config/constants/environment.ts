import { DEFAULTS } from './defaults';
import '../validateEnv';

export const ENV = {
    NODE_ENV: process.env.NODE_ENV || DEFAULTS.NODE_ENV,
    PORT: Number(process.env.PORT) || DEFAULTS.PORT,
    RETRY_LIMIT: Number(process.env.RETRY_ATTEMPTS) || DEFAULTS.RETRY_ATTEMPTS,
    REDIS: {
        URL: process.env.REDIS_URL || DEFAULTS.REDIS.URL,
        HOST: process.env.REDIS_HOST || DEFAULTS.REDIS.HOST,
        PORT: Number(process.env.REDIS_PORT) || DEFAULTS.REDIS.PORT,
        CACHE_EXPIRY: Number(process.env.CACHE_EXPIRY) || DEFAULTS.REDIS.CACHE_EXPIRY,
        RETRY_DELAY: Number(process.env.RETRY_DELAY) || DEFAULTS.REDIS.RETRY_DELAY
    }
};