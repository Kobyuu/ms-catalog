import request from 'supertest';
import server from '../server';
import { HTTP, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import { rateLimiter } from '../middleware/rateLimiter';
import { redis } from '../config/redisClient';
import { ProductService } from '../services/productService';
import { CustomError } from '../utils/CustomError';

describe('Product API Integration Tests', () => {
  // Silencia console.error para evitar que se muestren mensajes en la consola durante los tests
  let consoleErrorSpy: jest.SpyInstance;
  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  const mockProduct = {
    name: 'Test Product',
    price: 99.99,
    activate: true
  };

  const updatedProduct = {
    name: 'Updated Test Product',
    price: 79.99,
    activate: false
  };

  const mockProductId = 1;

  beforeEach(() => {
    rateLimiter.resetKey('::ffff:127.0.0.1');
    jest.clearAllMocks();
  });

  // Obtener producto por ID
  describe('GET /api/product/:id', () => {
    it('should get product by id successfully', async () => {
      jest.spyOn(ProductService, 'getProductById').mockResolvedValueOnce({
        ...mockProduct,
        id: mockProductId
      });

      const response = await request(server)
        .get(`/api/product/${mockProductId}`)
        .expect(HTTP.OK);

      expect(response.body).toHaveProperty('message', SUCCESS_MESSAGES.PRODUCT_FETCHED);
      expect(response.body.data).toMatchObject(expect.objectContaining(mockProduct));
    });

    it('should return 404 if product not found', async () => {
      // Simular un error que retorna un CustomError con status 404
      jest.spyOn(ProductService, 'getProductById').mockRejectedValueOnce(new CustomError(HTTP.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND));

      const response = await request(server)
        .get('/api/product/99999')
        .expect(HTTP.NOT_FOUND);

      expect(response.body).toHaveProperty('error', ERROR_MESSAGES.NOT_FOUND);
    });
  });

  // Actualizar un producto con PUT
  describe('PUT /api/product/:id', () => {
    it('should update a product', async () => {
      jest.spyOn(ProductService, 'updateProduct').mockResolvedValueOnce({
        ...updatedProduct,
        id: mockProductId
      });

      const response = await request(server)
        .put(`/api/product/${mockProductId}`)
        .send(updatedProduct)
        .expect(HTTP.OK);

      expect(response.body).toHaveProperty('message', SUCCESS_MESSAGES.PRODUCT_UPDATED);
      expect(response.body.data).toMatchObject(expect.objectContaining(updatedProduct));
    });

    it('should return 400 for invalid data', async () => {
      const invalidProduct = {
        name: '',
        price: -10
      };

      // Simular un error que retorna un CustomError con status 400
      jest.spyOn(ProductService, 'updateProduct').mockRejectedValueOnce(new CustomError(HTTP.BAD_REQUEST, ERROR_MESSAGES.INVALID_DATA));

      const response = await request(server)
        .put(`/api/product/${mockProductId}`)
        .send(invalidProduct)
        .expect(HTTP.BAD_REQUEST);

      expect(response.body).toHaveProperty('error', ERROR_MESSAGES.INVALID_DATA);
    });
  });

  // Activar/Desactivar producto
  describe('PATCH /api/product/:id', () => {
    it('should toggle product activation', async () => {
      jest.spyOn(ProductService, 'toggleActivate').mockResolvedValueOnce({
        ...mockProduct,
        id: mockProductId,
        activate: !mockProduct.activate
      });

      const response = await request(server)
        .patch(`/api/product/${mockProductId}`)
        .expect(HTTP.OK);

      expect(response.body).toHaveProperty('message', SUCCESS_MESSAGES.PRODUCT_UPDATED);
      expect(response.body.data.activate).toBe(!mockProduct.activate);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    consoleErrorSpy.mockRestore();
    await redis.quit();
  });
});
