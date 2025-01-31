import request from 'supertest';
import express from 'express';
import productRoutes from '../router'
import Product from '../models/Product.model';
import db from '../config/db';
import { HTTP } from '../config/constants/httpStatus';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants/messages';

describe('Product API Tests', () => {
  let app: express.Application;

  const testProduct = {
    name: "Test Product",
    price: 99.99,
    activate: true
  };

  beforeAll(async () => {
    // Create express app without middleware
    app = express();
    app.use(express.json());
    app.use('/api/products', productRoutes);

    try {
      await db.authenticate();
      await db.sync({ force: true });
    } catch (error) {
      console.error('Database setup failed:', error);
    }
  });

  afterAll(async () => {
    await db.close();
  });

  afterEach(async () => {
    await Product.destroy({ where: {} });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const response = await request(app)
        .post('/api/products')
        .send(testProduct);

      expect(response.status).toBe(HTTP.CREATED);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.PRODUCT_CREATED);
      expect(response.body.data.name).toBe(testProduct.name);
      expect(response.body.data.price).toBe(testProduct.price);
    });

    it('should fail with invalid data', async () => {
      const invalidProduct = { name: '', price: -10 };
      const response = await request(app)
        .post('/api/products')
        .send(invalidProduct);

      expect(response.status).toBe(HTTP.BAD_REQUEST);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      await Product.create(testProduct);
    });

    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/products');

      expect(response.status).toBe(HTTP.OK);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.PRODUCTS_FETCHED);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });
  });

  describe('GET /api/products/:id', () => {
    let productId: number;

    beforeEach(async () => {
      const product = await Product.create(testProduct);
      productId = product.id;
    });

    it('should get product by id', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`);

      expect(response.status).toBe(HTTP.OK);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.PRODUCT_FETCHED);
      expect(response.body.data.id).toBe(productId);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/999999');

      expect(response.status).toBe(HTTP.NOT_FOUND);
      expect(response.body.error).toBe(ERROR_MESSAGES.NOT_FOUND);
    });
  });

  describe('PUT /api/products/:id', () => {
    let productId: number;

    beforeEach(async () => {
      const product = await Product.create(testProduct);
      productId = product.id;
    });

    it('should update product', async () => {
      const updateData = {
        name: "Updated Product",
        price: 199.99,
        activate: false
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send(updateData);

      expect(response.status).toBe(HTTP.OK);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.PRODUCT_UPDATED);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);
    });
  });

  describe('PATCH /api/products/:id', () => {
    let productId: number;

    beforeEach(async () => {
      const product = await Product.create(testProduct);
      productId = product.id;
    });

    it('should toggle product activation', async () => {
      const response = await request(app)
        .patch(`/api/products/${productId}`);

      expect(response.status).toBe(HTTP.OK);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.PRODUCT_ACTIVATED);
      expect(response.body.data.activate).toBe(!testProduct.activate);
    });
  });
});