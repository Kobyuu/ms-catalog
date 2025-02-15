import { axiosInstance } from '../config/axiosClient';
import MockAdapter from 'axios-mock-adapter';
// import redisClient from '../config/redisClient';
import { cacheService } from '../services/redisCacheService';

// Agregar el mock de redisClient al inicio
jest.mock('../config/redisClient', () => ({
  __esModule: true,
  default: {
    quit: jest.fn().mockResolvedValue('OK')
  }
}));

// Importar el mock después de crearlo
const redisClient = require('../config/redisClient').default;

describe('Axios Retry Tests', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
    jest.spyOn(cacheService, 'getFromCache').mockResolvedValue(null);
    jest.spyOn(cacheService, 'setToCache').mockResolvedValue(undefined);
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
    jest.spyOn(cacheService, 'getFromCache').mockResolvedValueOnce(cachedData);
    
    try {
      await axiosInstance.get(endpoint);
      // Si no se lanza error, forzamos el fallo:
      throw new Error('Expected axiosInstance.get to throw an error');
    } catch (error) { 
      // Se hace cast para acceder a error.response
      const err = error as { response?: { data: any } };
      expect(err.response?.data).toEqual(cachedData);
    }
  });

  it('should handle network errors', async () => {
    const endpoint = '/network-error';
    mock.onGet(endpoint).networkError(); // Simular error de red

    await expect(axiosInstance.get(endpoint))
      .rejects
      .toThrow('Network Error');
  });

  afterAll(async () => {
    await redisClient.quit();
  });
});