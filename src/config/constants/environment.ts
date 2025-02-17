import { validateEnv } from '../validateEnv';
import { DEFAULTS } from './defaults';

validateEnv();

//Llamado a process.env para obtener las variables de entorno
const {
    NODE_ENV,
    PORT,
    RETRY_ATTEMPTS,
    REDIS_URL,
    REDIS_HOST,
    REDIS_PORT,
    CACHE_EXPIRY,
    RETRY_DELAY
} = process.env;
// Definición de las variables de entorno
export const ENV = {
    NODE_ENV: NODE_ENV || DEFAULTS.NODE_ENV,
    PORT: Number(PORT) || DEFAULTS.PORT,
    RETRY_LIMIT: Number(RETRY_ATTEMPTS) || DEFAULTS.RETRY_ATTEMPTS,
    REDIS: {
        URL: REDIS_URL || DEFAULTS.REDIS.URL,
        HOST: REDIS_HOST || DEFAULTS.REDIS.HOST,
        PORT: Number(REDIS_PORT) || DEFAULTS.REDIS.PORT,
        CACHE_EXPIRY: Number(CACHE_EXPIRY) || DEFAULTS.REDIS.CACHE_EXPIRY,
        RETRY_DELAY: Number(RETRY_DELAY) || DEFAULTS.REDIS.RETRY_DELAY
    },
    POOL: {
        MAX_CONNECTIONS: 5,
        MIN_CONNECTIONS: 1,
        IDLE_TIME: 600000, // 10 minutos en milisegundos
        ACQUIRE_TIMEOUT: 30000 // 30 segundos en milisegundos
    }
} as const;
