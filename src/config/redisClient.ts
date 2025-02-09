import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { ENV } from './constants/environment';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';

// Crear una instancia de Redis y conectarla
const redis = process.env.NODE_ENV === 'test' 
  ? new RedisMock()
  : new Redis({
      host: ENV.REDIS.HOST,
      port: ENV.REDIS.PORT,
      retryStrategy: (times) => {
        return Math.min(times * 50, ENV.REDIS.RETRY_DELAY);
      }
    });

redis.on('connect', () => {
  console.log(SUCCESS_MESSAGES.REDIS_CONNECTION);
});

redis.on('error', (err) => {
  console.log(ERROR_MESSAGES.REDIS_CONNECTION);
  console.error(ERROR_MESSAGES.REDIS_CLIENT_ERROR, err);
});

export { redis };