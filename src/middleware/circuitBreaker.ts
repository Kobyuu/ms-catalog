import CircuitBreaker from 'opossum';
import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';

const breakerOptions = {
  timeout: 3000,
  errorThresholdPercentage: 30,
  resetTimeout: 10000,
  volumeThreshold: 1,
  rollingCountTimeout: 10000,
  rollingCountBuckets: 10,
};

const breakers = {
  getAllProducts: new CircuitBreaker(ProductService.getAllProducts, breakerOptions),
  getProductById: new CircuitBreaker(ProductService.getProductById, breakerOptions),
  createProduct: new CircuitBreaker(ProductService.createProduct, breakerOptions),
  updateProduct: new CircuitBreaker(ProductService.updateProduct, breakerOptions),
  toggleActivate: new CircuitBreaker(ProductService.toggleActivate, breakerOptions)
};

// Add fallback handlers for all operations
Object.entries(breakers).forEach(([operation, breaker]) => {
  breaker.fallback(() => {
    return Promise.reject({
      statusCode: 503,
      error: `Service ${operation} is temporarily unavailable`
    });
  });

  // Add comprehensive monitoring
  breaker.on('open', () => console.log(`Circuit Breaker ${operation} is now OPEN`));
  breaker.on('close', () => console.log(`Circuit Breaker ${operation} is now CLOSED`));
  breaker.on('halfOpen', () => console.log(`Circuit Breaker ${operation} is now HALF-OPEN`));
  breaker.on('fallback', () => console.log(`Circuit Breaker ${operation} fallback executed`));
});

export const withCircuitBreaker = (operation: keyof typeof breakers) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const breaker = breakers[operation];

    try {
      if (breaker.opened) {
        res.status(503).json({
          error: 'Service is temporarily unavailable',
          statusCode: 503
        });
        return;
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
    } catch (error: any) {
      if (error?.statusCode) {
        res.status(error.statusCode).json(error);
        return;
      }
      next(error);
    }
  };
};