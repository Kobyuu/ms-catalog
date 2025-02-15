import request from 'supertest';
import server from '../server';
import { HTTP, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import redisClient from '../config/redisClient';
import { ProductService } from '../services/productService';
import { CustomError } from '../utils/CustomError';

describe('Product API Integration Tests', () => {
  let consoleErrorSpy: jest.SpyInstance; // Se agrega la anotación de tipo

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

  describe('GET /api/product', () => {
    it('should get all products successfully', async () => {
      const mockProducts = [
        { ...mockProduct, id: 1 },
        { ...mockProduct, id: 2, name: 'Test Product 2' }
      ];

      jest.spyOn(ProductService, 'getAllProducts').mockResolvedValueOnce(mockProducts);

      const response = await request(server)
        .get('/api/product')
        .expect(HTTP.OK);

      expect(response.body).toHaveProperty('message', SUCCESS_MESSAGES.PRODUCTS_FETCHED);
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle empty products list', async () => {
      jest.spyOn(ProductService, 'getAllProducts').mockResolvedValueOnce([]);

      const response = await request(server)
        .get('/api/product')
        .expect(HTTP.OK);

      expect(response.body.data).toHaveLength(0);
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

    it('should return 404 for non-existent product', async () => {
      jest.spyOn(ProductService, 'toggleActivate').mockRejectedValueOnce(
        new CustomError(HTTP.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND)
      );

      const response = await request(server)
        .patch(`/api/product/99999`)
        .expect(HTTP.NOT_FOUND);

      expect(response.body).toHaveProperty('error', ERROR_MESSAGES.NOT_FOUND);
    });
  });

  describe('POST /api/product', () => {
    it('should create a product successfully', async () => {
      jest.spyOn(ProductService, 'createProduct').mockResolvedValueOnce({
        ...mockProduct,
        id: mockProductId
      });

      const response = await request(server)
        .post('/api/product')
        .send(mockProduct)
        .expect(HTTP.CREATED);

      expect(response.body).toHaveProperty('message', SUCCESS_MESSAGES.PRODUCT_CREATED);
      expect(response.body.data).toMatchObject(mockProduct);
    });

    it('should return 400 for invalid product data', async () => {
      jest.spyOn(ProductService, 'createProduct').mockRejectedValueOnce(
        new CustomError(HTTP.BAD_REQUEST, ERROR_MESSAGES.INVALID_DATA)
      );

      const response = await request(server)
        .post('/api/product')
        .send(invalidProduct)
        .expect(HTTP.BAD_REQUEST);

      expect(response.body).toHaveProperty('error', ERROR_MESSAGES.INVALID_DATA);
    });
  });

  describe('Error handling', () => {
    it('should handle internal server errors', async () => {
      jest.spyOn(ProductService, 'getProductById').mockRejectedValueOnce(
        new Error('Internal Server Error')
      );

      const response = await request(server)
        .get(`/api/product/${mockProductId}`)
        .expect(HTTP.SERVER_ERROR);

      expect(response.body).toHaveProperty('error');
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
