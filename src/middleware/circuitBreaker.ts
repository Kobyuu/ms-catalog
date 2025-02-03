import CircuitBreaker from 'opossum';
import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { HTTP } from '../config/constants/httpStatus';

const breakerOptions = {
  timeout: 3000,                    
  errorThresholdPercentage: 30,     
  resetTimeout: 10000,              
  volumeThreshold: 1,               
  rollingCountTimeout: 10000,       
  rollingCountBuckets: 10,         
};

// Create circuit breakers for each service method
const breakers = {
  getAllProducts: new CircuitBreaker(ProductService.getAllProducts, breakerOptions),
  getProductById: new CircuitBreaker(ProductService.getProductById, breakerOptions),
  createProduct: new CircuitBreaker(ProductService.createProduct, breakerOptions),
  updateProduct: new CircuitBreaker(ProductService.updateProduct, breakerOptions),
  toggleActivate: new CircuitBreaker(ProductService.toggleActivate, breakerOptions)
};

breakers.getProductById.fallback(() => {
  return Promise.reject({
    statusCode: 503,
    error: 'Error al obtenr producto por id'
  });
});

breakers.createProduct.fallback(() => {
  return Promise.reject({
    statusCode: 503,
    error: 'error al crear prodtucto'
  });
});

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
      if (breaker.opened) {
        return res.status(503).json({
          error: 'Service is temporarily unavailable. Please try again later.',
          statusCode: 503
        });
      }

      const params = operation === 'getProductById' || operation === 'toggleActivate' 
        ? [req.params.id]
        : operation === 'updateProduct' 
          ? [req.params.id, req.body]
          : operation === 'createProduct'
            ? [req.body]
            : [];

      const result = await breaker.fire(...params);
      res.locals.result = result;
      next();
    } catch (error) {
      // Si el error posee un statusCode, responder con ese código
      if (error && error.statusCode) {
        return res.status(error.statusCode).json(error);
      }

      if (breaker.opened) {
        return res.status(503).json({
          error: 'Service is temporarily unavailable. Please try again later.',
          statusCode: 503
        });
      }
      next(error);
    }
  };
};
