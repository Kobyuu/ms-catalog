import request from 'supertest';
import server from '../server';
import { ProductService } from '../services/productService';
import { HTTP, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import redisClient from '../config/redisClient';
import { CustomError } from '../utils/CustomError';

// Mock ProductService
jest.mock('../services/productService');
// Mock Redis client
jest.mock('../config/redisClient', () => ({
  __esModule: true,
  default: {
    quit: jest.fn().mockResolvedValue('OK')
  }
}));

describe('ProductController', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  const mockProduct = {
    name: 'Test Product',
    price: 99.99,
    activate: true
  };

  const mockProductId = 1;

  describe('GET /api/product', () => {
    it('should get all products', async () => {
      const mockProducts = [
        { id: 1, ...mockProduct },
        { id: 2, ...mockProduct, name: 'Test Product 2' }
      ];
      jest.spyOn(ProductService, 'getAllProducts').mockResolvedValueOnce(mockProducts);

      const response = await request(server)
        .get('/api/product')
        .expect(HTTP.OK);

      expect(response.body).toHaveProperty('message', SUCCESS_MESSAGES.PRODUCTS_FETCHED);
      expect(response.body.data).toEqual(mockProducts);
    });

    it('should handle empty product list', async () => {
      jest.spyOn(ProductService, 'getAllProducts').mockResolvedValueOnce([]);

      const response = await request(server)
        .get('/api/product')
        .expect(HTTP.OK);

      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/product/:id', () => {
    it('should get product by id', async () => {
      jest.spyOn(ProductService, 'getProductById').mockResolvedValueOnce({
        id: mockProductId,
        ...mockProduct
      });

      const response = await request(server)
        .get(`/api/product/${mockProductId}`)
        .expect(HTTP.OK);

      expect(response.body).toHaveProperty('message', SUCCESS_MESSAGES.PRODUCT_FETCHED);
      expect(response.body.data).toMatchObject(mockProduct);
    });

    it('should return 404 for non-existent product', async () => {
      jest.spyOn(ProductService, 'getProductById').mockRejectedValueOnce(
        new CustomError(HTTP.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND)
      );

      const response = await request(server)
        .get('/api/product/999')
        .expect(HTTP.NOT_FOUND);

      expect(response.body).toHaveProperty('error', ERROR_MESSAGES.NOT_FOUND);
    });
  });

  describe('POST /api/product', () => {
    it('should create product', async () => {
      jest.spyOn(ProductService, 'createProduct').mockResolvedValueOnce({
        id: mockProductId,
        ...mockProduct
      });

      const response = await request(server)
        .post('/api/product')
        .send(mockProduct)
        .expect(HTTP.CREATED);

      expect(response.body).toHaveProperty('message', SUCCESS_MESSAGES.PRODUCT_CREATED);
      expect(response.body.data).toMatchObject(mockProduct);
    });

    it('should validate required fields', async () => {
      const invalidProduct = { name: '', price: -10 };
      
      // Simular el rechazo con CustomError
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

  describe('PUT /api/product/:id', () => {
    const updatedProduct = {
      name: 'Updated Product',
      price: 149.99,
      activate: false
    };

    it('should update product', async () => {
      jest.spyOn(ProductService, 'updateProduct').mockResolvedValueOnce({
        id: mockProductId,
        ...updatedProduct
      });

      const response = await request(server)
        .put(`/api/product/${mockProductId}`)
        .send(updatedProduct)
        .expect(HTTP.OK);

      expect(response.body).toHaveProperty('message', SUCCESS_MESSAGES.PRODUCT_UPDATED);
      expect(response.body.data).toMatchObject(updatedProduct);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    consoleErrorSpy.mockRestore();
    await redisClient.quit();
  });
});