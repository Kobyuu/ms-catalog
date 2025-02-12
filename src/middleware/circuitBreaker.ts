import CircuitBreaker from 'opossum';
import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES, HTTP, CIRCUIT_BREAKER_MESSAGES } from '../config/constants';

const breakerOptions = {
  timeout: 5000,                   // Timeout de 5 segundos
  errorThresholdPercentage: 70,    // Umbral del 70%
  resetTimeout: 10000,             // Tiempo de reinicio de 10 segundos
  volumeThreshold: 10              // Mínimo de llamadas antes de activarse
};

export class CircuitBreakerService {
  private static breakers: { [key: string]: CircuitBreaker } = {};

  static getBreaker(operationName: string, operation: (...args: unknown[]) => Promise<unknown>): CircuitBreaker {
    if (!this.breakers[operationName]) {
      const breaker = new CircuitBreaker(operation, breakerOptions);
      
      breaker.fallback(() => {
        throw new Error(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
      });

      breaker.on('open', () => console.log(`${operationName}: ${CIRCUIT_BREAKER_MESSAGES.OPEN}`));
      breaker.on('halfOpen', () => console.log(`${operationName}: ${CIRCUIT_BREAKER_MESSAGES.HALF_OPEN}`));
      breaker.on('close', () => console.log(`${operationName}: ${CIRCUIT_BREAKER_MESSAGES.CLOSED}`));

      this.breakers[operationName] = breaker;
    }
    return this.breakers[operationName];
  }
}

export const withCircuitBreaker = (req: Request, res: Response, next: NextFunction) => {
  const breaker = CircuitBreakerService.getBreaker('middleware', async () => {
    if (Math.random() < 0.5) {
      throw new Error('Simulated failure');
    }
    return Promise.resolve();
  });

  if (breaker.opened) {
    return res.status(HTTP.SERVICE_UNAVAILABLE).json({ message: ERROR_MESSAGES.SERVICE_UNAVAILABLE });
  }

  breaker.fire()
    .then(() => next())
    .catch(() => res.status(HTTP.SERVICE_UNAVAILABLE).json({ message: ERROR_MESSAGES.SERVICE_UNAVAILABLE }));
};

export default CircuitBreakerService;
