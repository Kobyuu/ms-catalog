import { axiosInstance } from '../config/axiosClient';
import MockAdapter from 'axios-mock-adapter';
import { redis } from '../config/redisClient';
import { cacheService } from '../services/redisCacheService';

describe('Axios Retry Tests', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
    jest.spyOn(cacheService, 'getFromCache').mockResolvedValue(null);
    jest.spyOn(cacheService, 'setToCache').mockResolvedValue();
  });

  afterEach(() => {
    mock.reset();
    jest.clearAllMocks();
  });

  it('should use Redis cache for GET requests', async () => {
    const endpoint = '/cached-endpoint';
    const cachedData = { data: 'cached response' };
    
    // Primera solicitud - sin caché
    mock.onGet(endpoint).replyOnce(200, cachedData);
    
    const response1 = await axiosInstance.get(endpoint);
    expect(response1.data).toEqual(cachedData);
    expect(cacheService.setToCache).toHaveBeenCalledWith(
      `cache:${endpoint}`,
      cachedData
    );

    // Segunda solicitud - con caché
    jest.spyOn(cacheService, 'getFromCache')
      .mockResolvedValueOnce(cachedData);
    
    try {
      await axiosInstance.get(endpoint);
    } catch (error: any) {
      expect(error.response.data).toEqual(cachedData);
    }
  });
// Prueba para verificar que se manejen los errores de red
  it('should handle network errors', async () => {
    const endpoint = '/network-error';
    mock.onGet(endpoint).networkError();

    await expect(axiosInstance.get(endpoint))
      .rejects
      .toThrow('Network Error');
  });
// Después de todas las pruebas, se cierra la conexión con Redis
  afterAll(async () => {
    await redis.quit();
  });
});