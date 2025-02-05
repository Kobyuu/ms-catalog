import CircuitBreaker from 'opossum';
import { Request, Response, NextFunction } from 'express';
import { ProductService, CustomError } from '../services/productService';
import { ERROR_MESSAGES } from '../config/constants';

enum State {
  CLOSED,
  OPEN,
  HALF_OPEN
}
// Implementación de un circuit breaker personalizado
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
// Implementación de los métodos de circuit breaker
  private success(): void {
    this.failureCount = 0;
    this.state = State.CLOSED;
  }

  private fail(): void {
    this.failureCount++;
    console.log(`Failure count: ${this.failureCount}`);
    if (this.failureCount >= this.failureThreshold) {
      this.state = State.OPEN;
      this.nextAttempt = Date.now() + this.resetTimeout;
      console.log(`Circuit Breaker ${this.operation.name} is now OPEN`);
    }
  }

  private halfOpen(): void {
    this.state = State.HALF_OPEN;
  }
  // Implementación de la función de fallback
  private async fallback(...args: any[]): Promise<any> {
    throw new CustomError(503, ERROR_MESSAGES.SERVICE_UNAVAILABLE);
  }
  // Implementación de la función de disparo
  async fire(...args: any[]): Promise<any> {
    if (this.opened) {
      console.log(`El circuit breaker ${this.operation.name} está abierto`);
      return this.fallback(...args);
    }
    // Implementación de la operación del circuit breaker
    try {
      const result = await this.operation(...args);
      this.success();
      return result;
    } catch (error: any) {
      // Si el error es un error de servidor, marcamos el circuit breaker como fallido
      if (!error.statusCode || error.statusCode >= 500) {
        this.fail();
      }
      throw error;
    }
  }
}

// Crear instancias de circuit breaker para cada operación

export const breakers = {
  getAllProducts: new CustomCircuitBreaker(ProductService.getAllProducts),
  getProductById: new CustomCircuitBreaker(ProductService.getProductById),
  createProduct: new CustomCircuitBreaker(ProductService.createProduct),
  updateProduct: new CustomCircuitBreaker(ProductService.updateProduct),
  toggleActivate: new CustomCircuitBreaker(ProductService.toggleActivate)
};

// Middleware del circuit breaker
export const withCircuitBreaker = (operation: keyof typeof breakers) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const breaker = breakers[operation];

    try {
      // Si el breaker ya está abierto, lanzamos el error de servicio no disponible.
      if (breaker.opened) {
        throw new CustomError(503, ERROR_MESSAGES.SERVICE_UNAVAILABLE);
      }
      // Ejecutar la operación del servicio
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
      // Si el breaker está abierto, obtenemos la respuesta 503
      const statusCode = breaker.opened ? 503 : error.statusCode || 500;
      const errorMessage = breaker.opened ? ERROR_MESSAGES.SERVICE_UNAVAILABLE : error.message;
      
      res.status(statusCode).json({
        error: errorMessage,
        statusCode
      });
    }
  };
};