import CircuitBreaker from 'opossum';
import { Request, Response, NextFunction } from 'express';
import { ProductService, CustomError } from '../services/productService';
import { ERROR_MESSAGES } from '../config/constants';

enum State {
  CLOSED,
  OPEN,
  HALF_OPEN
}

export class CustomCircuitBreaker {
  private state: State = State.CLOSED;
  private failureCount: number = 0;
  private nextAttempt: number = Date.now();
  private readonly failureThreshold: number = 3;
  private readonly resetTimeout: number = 60000; // 60 seconds

  constructor(private operation: Function) {}

  get opened(): boolean {
    return this.state === State.OPEN;
  }

  private success(): void {
    this.failureCount = 0;
    this.state = State.CLOSED;
  }

  private fail(): void {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = State.OPEN;
      this.nextAttempt = Date.now() + this.resetTimeout;
      console.log(`Circuit Breaker ${this.operation.name} is now OPEN`);
    }
  }

  private halfOpen(): void {
    this.state = State.HALF_OPEN;
  }

  private async fallback(...args: any[]): Promise<any> {
    // Implement your fallback logic here
    throw new CustomError(503, ERROR_MESSAGES.SERVICE_UNAVAILABLE);
  }

  async fire(...args: any[]): Promise<any> {
    if (this.opened) {
      if (Date.now() > this.nextAttempt) {
        this.halfOpen();
      } else {
        return this.fallback(...args);
      }
    }

    try {
      const result = await this.operation(...args);
      this.success();
      return result;
    } catch (error: any) {
      // Only count as failure if it's not a business error (404, 400, etc)
      if (!error.statusCode || error.statusCode >= 500) {
        this.fail();
      }
      throw error;
    }
  }
}

// Create breakers for each operation

export const breakers = {
  getAllProducts: new CustomCircuitBreaker(ProductService.getAllProducts),
  getProductById: new CustomCircuitBreaker(ProductService.getProductById),
  createProduct: new CustomCircuitBreaker(ProductService.createProduct),
  updateProduct: new CustomCircuitBreaker(ProductService.updateProduct),
  toggleActivate: new CustomCircuitBreaker(ProductService.toggleActivate)
};

// Middleware for circuit breaker
export const withCircuitBreaker = (operation: keyof typeof breakers) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const breaker = breakers[operation];

    try {
      if (breaker.opened) {
        throw new CustomError(503, ERROR_MESSAGES.SERVICE_UNAVAILABLE);
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
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        error: error.message,
        statusCode
      });
    }
  };
};