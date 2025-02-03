import request from 'supertest';
import express from 'express';
import { rateLimiter } from '../middleware/rateLimiter';
import { withCircuitBreaker } from '../middleware/circuitBreaker';
import productRoutes from '../router';
import db from '../config/db';
import Product from '../models/Product.model';
import { HTTP } from '../config/constants/httpStatus';
import { redis } from '../config/constants/axiosClient';

jest.setTimeout(60000);

describe('Infrastructure Tests', () => {
  let app: express.Application;

  beforeAll(async () => {
    try {
      app = express();
      app.use(express.json());
      app.use('/api/products', productRoutes);

      await db.authenticate();
      await db.sync({ force: true });
      await redis.ping();
    } catch (error) {
      console.error('Error en beforeAll:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await Promise.all([
        db.close(),
        redis.quit()
      ]);
    } catch (error) {
      console.error('Error en afterAll:', error);
    }
  });

  beforeEach(async () => {
    try {
      await db.authenticate();
      await Product.destroy({ where: {} });
      await redis.flushall();
    } catch (error) {
      console.error('Error en beforeEach:', error);
    }
  });

  describe('Rate Limiter', () => {
    let rateLimitApp: express.Application;

    beforeAll(() => {
      rateLimitApp = express();
      rateLimitApp.use(express.json());
      rateLimitApp.use(rateLimiter);
      rateLimitApp.use('/api/products', productRoutes);
    });

    it('should block requests after exceeding rate limit', async () => {
      const requests = Array(101).fill(null);
      
      for (const [index, _] of requests.entries()) {
        const response = await request(rateLimitApp)
          .get('/api/products');
        
        if (index === 100) {
          expect(response.status).toBe(429);
          expect(response.body.error).toContain('Demasiadas peticiones');
        } else {
          expect(response.status).toBe(HTTP.OK);
        }
      }
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit after multiple failures', async () => {
      // Asegurar que la base de datos está cerrada
      await db.close();
      
      // Realizar suficientes peticiones fallidas para abrir el circuito
      const failedRequests = Array(3).fill(null);
      for (const _ of failedRequests) {
        await request(app)
          .get('/api/products')
          .expect(500);
      }

      // Esperar a que el circuito se abra
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Intentar una petición más, debería fallar con 503
      const finalResponse = await request(app)
        .get('/api/products');

      expect(finalResponse.status).toBe(503);
      expect(finalResponse.body.error).toContain('Service is temporarily unavailable');

      // Restaurar la conexión a la base de datos para las siguientes pruebas
      await db.authenticate();
    }, 10000); // Aumentar el timeout para esta prueba específica
  });
});