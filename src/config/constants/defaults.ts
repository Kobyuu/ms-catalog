export const DEFAULTS = {
    NODE_ENV: 'development',
    PORT: 4001,
    REDIS: {
        HOST: 'redis',
        PORT: 6379,
        URL: 'redis://redis:6379',
        CACHE_EXPIRY: 3600,
        RETRY_DELAY: 1000
    },
    RETRY_ATTEMPTS: 3
};