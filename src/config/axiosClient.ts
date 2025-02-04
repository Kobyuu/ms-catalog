import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { ENV } from '../config/constants';
import { redis } from '../config/redisClient';

// Crear instancia de Axios
const axiosInstance: AxiosInstance = axios.create();

// Configurar retry
axiosRetry(axiosInstance, {
  retries: ENV.RETRY_LIMIT,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === 'ECONNABORTED';
  }
});

// Interceptor para cache con Redis
axiosInstance.interceptors.request.use(async (config) => {
  const cacheKey = `cache:${config.url}`;
  const cachedData = await redis.get(cacheKey);

  if (cachedData && config.method === 'get') {
    return Promise.reject({
      config,
      response: { data: JSON.parse(cachedData) }
    });
  }

  return config;
});

axiosInstance.interceptors.response.use(async (response) => {
  if (response.config.method === 'get') {
    const cacheKey = `cache:${response.config.url}`;
    await redis.setex(cacheKey, 3600, JSON.stringify(response.data));
  }
  return response;
});

export { axiosInstance };