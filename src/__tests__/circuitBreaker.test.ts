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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle service failure and open circuit', async () => {
    const failingOperation = withCircuitBreaker('getAllProducts');
    
    // Fail the circuit breaker threshold number of times
    const threshold = 3;
    for (let i = 0; i < threshold; i++) {
      await failingOperation(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );
      // Add small delay between calls to ensure failures are registered
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Make sure we wait longer for the circuit breaker state to update
    await new Promise(resolve => setTimeout(resolve, 200));

    // Clear previous mock calls
    (mockRes.status as jest.Mock).mockClear();
    (mockRes.json as jest.Mock).mockClear();

    // Now the circuit should be open
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