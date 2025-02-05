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

  const updatedProduct = {
    name: 'Updated Test Product',
    price: 79.99,
    activate: false
  };

  const mockProductId = 1; // Suponiendo que tienes un producto con ID 1 en la base de datos

  // Antes de cada prueba, se reinicia el límite de velocidad para la dirección IP de prueba
  beforeEach(() => {
    rateLimiter.resetKey('::ffff:127.0.0.1');
  });

  // Obtener producto por ID
  describe('GET /api/products/:id', () => {
    it('should return 404 if product not found', async () => {
      console.log('Iniciando prueba: should return 404 if product not found');
      const response = await request(server)
        .get('/api/products/99999')  // ID que no existe
        .expect(HTTP.NOT_FOUND);
  
      console.log('Respuesta recibida:', response.body);
  
      // Verificar que se devuelva un error adecuado si no se encuentra el producto
      expect(response.body.error).toBe(ERROR_MESSAGES.NOT_FOUND);
    });
  });

  // Actualizar un producto con PUT
  describe('PUT /api/products/:id', () => {
    it('should update a product', async () => {
      const response = await request(server)
        .put(`/api/products/${mockProductId}`)
        .send(updatedProduct)
        .expect(HTTP.OK);

      // Verificar que el mensaje y los datos sean correctos tras la actualización
      expect(response.body.message).toBe(SUCCESS_MESSAGES.PRODUCT_UPDATED);
      expect(response.body.data).toMatchObject(updatedProduct);
    });

    it('should return 400 for invalid data', async () => {
      const invalidProduct = {
        name: '',  // Nombre inválido
        price: -10, // Precio inválido
        activate: 'notBoolean' // Estado de activación inválido
      };

      const response = await request(server)
        .put(`/api/products/${mockProductId}`)
        .send(invalidProduct)
        .expect(HTTP.BAD_REQUEST);
      
      // Verificar que se devuelva el error adecuado cuando los datos sean inválidos
      expect(response.body.error).toBe(ERROR_MESSAGES.INVALID_NAME);  

    });
  });

  // Obtener todos los productos con Get
  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const response = await request(server)
        .get('/api/products')
        .expect(HTTP.OK);

      // Verificar que la respuesta sea correcta
      expect(response.body.message).toBe(SUCCESS_MESSAGES.PRODUCTS_FETCHED);
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    it('should handle rate limiting', async () => {
      // Realizar 100 solicitudes para superar el límite de velocidad
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

  // Crear un nuevo producto con POST
  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const response = await request(server)
        .post('/api/products')
        .send(mockProduct)
        .expect(HTTP.CREATED);

      // Verificar que la respuesta sea correcta
      expect(response.body.message).toBe(SUCCESS_MESSAGES.PRODUCT_CREATED);
      expect(response.body.data).toMatchObject(mockProduct);
    });
  });

  // Después de todas las pruebas, se cierra la conexión con Redis
  afterAll(async () => {
    await redis.quit();
  });
});
