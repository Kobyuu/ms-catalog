import { withCircuitBreaker } from '../middleware/circuitBreaker';
import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { redis } from '../config/redisClient';
import { ERROR_MESSAGES } from '../config/constants';

jest.mock('../services/productService');

describe('Circuit Breaker Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction;
// Antes de cada prueba, se configuran los mocks y se simula un error en el servicio
  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
    
    (ProductService.getAllProducts as jest.Mock)
      .mockRejectedValue(new Error('Service error'));
  });
// Después de cada prueba, se limpian los mocks
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle service failure and open circuit', async () => {
    const failingOperation = withCircuitBreaker('getAllProducts');

    (ProductService.getAllProducts as jest.Mock).mockRejectedValue({
      response: { status: 500, data: 'Service error' }
    });
    
// Se simulan 3 errores consecutivos para abrir el circuito
    const threshold = 3;
    for (let i = 0; i < threshold; i++) {
      await failingOperation(
        mockReq as Request, 
        mockRes as Response,
        nextFunction
      );
// Se espera un tiempo para que el circuito se abra completamente
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    await new Promise(resolve => setTimeout(resolve, 200));
    
// Se limpian los mocks
    (mockRes.status as jest.Mock).mockClear();
    (mockRes.json as jest.Mock).mockClear();
  
// Se intenta realizar una operación después de abrir el circuito
    await failingOperation(
      mockReq as Request,
      mockRes as Response, 
      nextFunction
    );
  
    expect(mockRes.status).toHaveBeenCalledWith(503);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.SERVICE_UNAVAILABLE,
      statusCode: 503
    });
  });

// Después de todas las pruebas, se cierra la conexión con Redis
  afterAll(async () => {
    await redis.quit(); 
  });
});