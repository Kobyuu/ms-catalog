import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { ENV, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';
import { RedisConfig } from '../types/redis.types';

// Función para parsear la URL de Redis y obtener la configuración
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

// Obtiene la configuración de Redis desde la URL
const redisConfig = parseRedisUrl(ENV.REDIS.URL);

// Inicializa el cliente Redis (usa mock para tests)
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

// Manejadores de eventos de conexión
redisClient.on('connect', () => {
  console.log(SUCCESS_MESSAGES.REDIS_CONNECTION);
});

redisClient.on('error', (err) => {
  console.log(ERROR_MESSAGES.REDIS_CONNECTION);
  console.error(ERROR_MESSAGES.REDIS_CLIENT_ERROR, err);
});

export default redisClient;