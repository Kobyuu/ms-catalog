import { axiosInstance } from '../config/axiosClient';
import MockAdapter from 'axios-mock-adapter';
import { cacheService } from '../services/redisCacheService';
//test modificado
describe('Axios Client Tests', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
    jest.spyOn(cacheService, 'getFromCache').mockResolvedValue(null);
    jest.spyOn(cacheService, 'setToCache').mockResolvedValue(undefined);
  });

  afterEach(() => {
    mock.reset();
    jest.restoreAllMocks();
  });

  it('should make network request if cache is empty', async () => {
    const endpoint = '/test';
    const responseData = { data: 'test data' };
    mock.onGet(endpoint).reply(200, responseData);

    const response = await axiosInstance.get(endpoint);

    expect(cacheService.getFromCache).toHaveBeenCalledWith(`cache:${endpoint}`);
    expect(cacheService.setToCache).toHaveBeenCalledWith(`cache:${endpoint}`, responseData);
    expect(response.data).toEqual(responseData);
  });

  it('should return cached response if available', async () => {
    const endpoint = '/test';
    const cachedData = { data: 'cached data' };
    // Simular que existe dato en caché: el interceptor rechaza la solicitud con { response: { data: cachedData } }
    jest.spyOn(cacheService, 'getFromCache').mockResolvedValue(cachedData);
    
    try {
      await axiosInstance.get(endpoint);
    } catch (error: any) {
      expect(error.response.data).toEqual(cachedData);
      expect(cacheService.getFromCache).toHaveBeenCalledWith(`cache:${endpoint}`);
    }
  });

  it('should handle network errors', async () => {
    const endpoint = '/network-error';
    mock.onGet(endpoint).networkError();
    await expect(axiosInstance.get(endpoint)).rejects.toThrow('Network Error');
  });
});