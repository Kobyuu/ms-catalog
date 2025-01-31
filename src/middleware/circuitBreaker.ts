import CircuitBreaker from 'opossum';
import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { HTTP } from '../config/constants/httpStatus';

const breakerOptions = {
  timeout: 10000,          // Increase to 10 seconds
  errorThresholdPercentage: 80,  // More tolerant to errors
  resetTimeout: 60000      // Longer reset time
};

// Create circuit breakers for each service method
const breakers = {
  getAllProducts: new CircuitBreaker(ProductService.getAllProducts, breakerOptions),
  getProductById: new CircuitBreaker(ProductService.getProductById, breakerOptions),
  createProduct: new CircuitBreaker(ProductService.createProduct, breakerOptions),
  updateProduct: new CircuitBreaker(ProductService.updateProduct, breakerOptions),
  toggleActivate: new CircuitBreaker(ProductService.toggleActivate, breakerOptions)
};

// Add event listeners for monitoring
Object.values(breakers).forEach(breaker => {
  breaker.on('open', () => console.log('Circuit Breaker is now OPEN'));
  breaker.on('close', () => console.log('Circuit Breaker is now CLOSED'));
  breaker.on('halfOpen', () => console.log('Circuit Breaker is now HALF-OPEN'));
});

export const withCircuitBreaker = (operation: keyof typeof breakers) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const breaker = breakers[operation];
    
    try {
      // Pass the parameters based on the operation
      const params = operation === 'getProductById' || operation === 'toggleActivate' 
        ? [req.params.id]
        : operation === 'updateProduct' 
          ? [req.params.id, req.body]
          : operation === 'createProduct'
            ? [req.body]
            : [];

      const result = await breaker.fire(...params);
      res.locals.result = result; // Store result for the next middleware
      next();
    } catch (error) {
      if (breaker.opened) {
        return res.status(HTTP.SERVER_ERROR).json({
          error: 'Service is temporarily unavailable. Please try again later.',
          statusCode: HTTP.SERVER_ERROR
        });
      }
      next(error);
    }
  };
};