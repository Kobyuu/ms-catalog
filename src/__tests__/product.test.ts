import request from 'supertest';
import server from '../server';
import { HTTP, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import redisClient from '../config/redisClient';
import { ProductService } from '../services/productService';
import { CustomError } from '../utils/CustomError';

describe('Product API Integration Tests', () => {
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

  const invalidProduct = {
    name: '',
    price: -10
  };

  const mockProductId = 1;

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
      expect(response.body.data).toMatchObject(mockProduct);
    });

    it('should return 404 if product not found', async () => {
      jest.spyOn(ProductService, 'getProductById').mockRejectedValueOnce(
        new CustomError(HTTP.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND)
      );

      const response = await request(server)
        .get('/api/product/99999')
        .expect(HTTP.NOT_FOUND);

      expect(response.body).toHaveProperty('error', ERROR_MESSAGES.NOT_FOUND);
    });
  });

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
      expect(response.body.data).toMatchObject(updatedProduct);
    });

    it('should return 400 for invalid data', async () => {
      jest.spyOn(ProductService, 'updateProduct').mockRejectedValueOnce(
        new CustomError(HTTP.BAD_REQUEST, ERROR_MESSAGES.INVALID_DATA)
      );

      const response = await request(server)
        .put(`/api/product/${mockProductId}`)
        .send(invalidProduct)
        .expect(HTTP.BAD_REQUEST);

      expect(response.body).toHaveProperty('error', ERROR_MESSAGES.INVALID_DATA);
    });
  });

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
    await redisClient.quit();
  });
});
