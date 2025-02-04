import { withCircuitBreaker } from '../middleware/circuitBreaker';
import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { redis } from '../config/redisClient';

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
    
    // Mock the ProductService to simulate failures
    (ProductService.getAllProducts as jest.Mock).mockRejectedValue(new Error('Service error'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle service failure and open circuit', async () => {
    const failingOperation = withCircuitBreaker('getAllProducts');
    
    // We need multiple consecutive failures to open the circuit
    for (let i = 0; i < 3; i++) {
      await failingOperation(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );
    }

    // Wait for circuit breaker to open
    await new Promise(resolve => setTimeout(resolve, 100));

    // One more request after circuit is open
    await failingOperation(
      mockReq as Request,
      mockRes as Response,
      nextFunction
    );

    expect(mockRes.status).toHaveBeenCalledWith(503);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Service is temporarily unavailable',
      statusCode: 503
    });
  });

  afterAll(async () => {
    await redis.quit(); // Cierra la conexión con Redis
  });
});