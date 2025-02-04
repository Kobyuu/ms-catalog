import 'dotenv/config';
import { ERROR_MESSAGES } from './constants';

const requiredEnvVars = [
    'DATABASE_URL',
    'PORT',
    'REDIS_URL',
    'REDIS_HOST',
    'REDIS_PORT',
    'CACHE_EXPIRY',
    'RETRY_ATTEMPTS',
    'RETRY_DELAY'
];

requiredEnvVars.forEach((env) => {
    if (!process.env[env]) {
        throw new Error(`${ERROR_MESSAGES.ENV_VAR_NOT_DEFINED}: ${env}`);
    }
});