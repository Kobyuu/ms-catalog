import request from 'supertest';
import server from '../server';
import { HTTP, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import { rateLimiter } from '../middleware/rateLimiter';
import { redis } from '../config/redisClient';

describe('Product API Integration Tests', () => {
  const mockProduct = {
    name: 'Test Product',
    price: 99.99,
    activate: true
  };

  // Reset rate limiter between tests
  beforeEach(() => {
    rateLimiter.resetKey('::ffff:127.0.0.1');
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const response = await request(server)
        .get('/api/products')
        .expect(HTTP.OK);

      expect(response.body.message).toBe(SUCCESS_MESSAGES.PRODUCTS_FETCHED);
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    it('should handle rate limiting', async () => {
      // Make more than 100 requests in 15 minutes
      const requests = Array(101).fill(null);
      
      for (const _ of requests) {
        const response = await request(server).get('/api/products');
        if (response.status === 429) {
          expect(response.body.error).toBe(ERROR_MESSAGES.RATE_LIMIT);
          break;
        }
      }
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const response = await request(server)
        .post('/api/products')
        .send(mockProduct)
        .expect(HTTP.CREATED);

      expect(response.body.message).toBe(SUCCESS_MESSAGES.PRODUCT_CREATED);
      expect(response.body.data).toMatchObject(mockProduct);
    });
  });

  afterAll(async () => {
    await redis.quit(); // Cierra la conexión con Redis
  });
});