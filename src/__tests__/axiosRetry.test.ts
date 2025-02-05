import { axiosInstance } from '../config/axiosClient';
import MockAdapter from 'axios-mock-adapter';
import { redis } from '../config/redisClient';

describe('Axios Retry Tests', () => {
  let mock: MockAdapter;
// Antes de cada prueba, se crea una instancia de MockAdapter y se espía la función get de Redis
  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
    jest.spyOn(redis, 'get').mockResolvedValue(null);
    jest.spyOn(redis, 'setex').mockResolvedValue('OK');
  });
// Después de cada prueba, se reinician los mocks y se limpian los mocks de Jest
  afterEach(() => {
    mock.reset();
    jest.clearAllMocks();
  });
// Prueba para verificar que se reintenten las solicitudes fallidas
  it('should retry failed requests', async () => {
    let attemptCount = 0;
    const endpoint = '/test-endpoint';

    mock.onGet(endpoint).reply(() => {
      attemptCount++;
      if (attemptCount < 3) {
        return [500, {}];
      }
      return [200, { data: 'success' }];
    });

    try {
      const response = await axiosInstance.get(endpoint);
      expect(attemptCount).toBe(3);
      expect(response.status).toBe(200);
      expect(response.data.data).toBe('success');
    } catch (error) {
      fail('Should not throw an error');
    }
  });
// Prueba para verificar que se use la caché de Redis para las solicitudes GET
  it('should use Redis cache for GET requests', async () => {
    const endpoint = '/cached-endpoint';
    const cachedData = { data: 'cached response' };
    
    // First request - no cache
    jest.spyOn(redis, 'get').mockResolvedValueOnce(null);
    mock.onGet(endpoint).replyOnce(200, cachedData);
    
    const response1 = await axiosInstance.get(endpoint);
    expect(response1.data).toEqual(cachedData);
    expect(redis.setex).toHaveBeenCalled();

  // Segunda solicitud - caché
    jest.spyOn(redis, 'get').mockResolvedValueOnce(JSON.stringify(cachedData));
    
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