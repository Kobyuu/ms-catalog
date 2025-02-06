import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { ENV } from '../config/constants';
import { redis } from '../config/redisClient';
import { cacheService } from '../services/redisCacheService';


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
  if (config.method === 'get') {
    const cachedData = await cacheService.getFromCache(cacheKey);
    if (cachedData) {
      return Promise.reject({
        config,
        response: { data: cachedData }
      });
    }
  }
  return config;
});
// Interceptor para cache con Redis
axiosInstance.interceptors.response.use(async (response) => {
  if (response.config.method === 'get') {
    const cacheKey = `cache:${response.config.url}`;
    await cacheService.setToCache(cacheKey, response.data);
  }
  return response;
});

export { axiosInstance };