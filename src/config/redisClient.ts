import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { ENV, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';
import { RedisConfig } from '../types/redis.types';

// Crear una instancia de Redis y conectarla
const parseRedisUrl = (url: string): RedisConfig => {
  try {
    const redisUrl = new URL(url);
    return {
      host: redisUrl.hostname || ENV.REDIS.HOST,
      port: parseInt(redisUrl.port || ENV.REDIS.PORT.toString(), 10)
    };
  } catch (error) {
    console.error(ERROR_MESSAGES.REDIS_URL_PARSE, error);
    return {
      host: ENV.REDIS.HOST,
      port: ENV.REDIS.PORT
    };
  }
};

const redisConfig = parseRedisUrl(ENV.REDIS.URL);

const redisClient = process.env.NODE_ENV === 'test' 
  ? new RedisMock() 
  : new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      retryStrategy: (times: number): number => {
        return Math.min(
          times * ENV.REDIS.RETRY_DELAY, 
          ENV.REDIS.RETRY_DELAY
        );
      }
    });

redisClient.on('connect', () => {
  console.log(SUCCESS_MESSAGES.REDIS_CONNECTION);
});

redisClient.on('error', (err) => {
  console.log(ERROR_MESSAGES.REDIS_CONNECTION);
  console.error(ERROR_MESSAGES.REDIS_CLIENT_ERROR, err);
});

export default redisClient;