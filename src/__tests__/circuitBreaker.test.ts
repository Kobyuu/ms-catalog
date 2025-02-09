import request from 'supertest';
import express, { RequestHandler } from 'express';
import { CircuitBreakerService, withCircuitBreaker } from '../middleware/circuitBreaker';
import { ERROR_MESSAGES, HTTP } from '../config/constants';

const app = express();

// Ruta de prueba que usa el middleware del Circuit Breaker
app.get('/test', withCircuitBreaker as RequestHandler, (req, res) => {
  res.status(200).send('Success');
});

describe('CircuitBreaker Middleware', () => {
  beforeEach(() => {
    // Restaurar los mocks para que cada test sea independiente
    jest.restoreAllMocks();

    // Limpiar el estado de los breakers
    Object.values(CircuitBreakerService['breakers']).forEach(breaker => {
      breaker.close();
    });
  });

  it('should allow the request to pass through when the circuit is closed', async () => {
    // Forzamos que Math.random devuelva un valor alto para evitar fallos
    jest.spyOn(Math, 'random').mockReturnValue(0.9);

    const response = await request(app).get('/test');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Success');
  });

  it('should return service unavailable when the circuit is open', async () => {
    // Para este test, forzamos errores: Math.random devuelve siempre un valor bajo
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    // Obtener el mismo breaker que usa el middleware
    const middlewareBreaker = CircuitBreakerService.getBreaker('middleware', async () => {
      // Con Math.random() siempre menor a 0.5, se lanzará el error
      if (Math.random() < 0.5) {
        throw new Error('Simulated failure');
      }
      return Promise.resolve();
    });

    // Generar fallos para forzar la apertura del breaker
    for (let i = 0; i < 5; i++) {
      try {
        await middlewareBreaker.fire();
      } catch (err) {
        // Error esperado
      }
    }

    // Esperar a que se propague el estado del breaker (ajusta el timeout si es necesario)
    await new Promise(resolve => setTimeout(resolve, 200));

    const response = await request(app).get('/test');
    expect(response.status).toBe(HTTP.SERVICE_UNAVAILABLE);
    expect(response.body).toEqual({ message: ERROR_MESSAGES.SERVICE_UNAVAILABLE });
  });

  it('should handle errors and open the circuit', async () => {
    // Forzamos errores constantes para abrir el breaker
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const middlewareBreaker = CircuitBreakerService.getBreaker('middleware', async () => {
      if (Math.random() < 0.5) {
        throw new Error('Simulated failure');
      }
      return Promise.resolve();
    });

    // Generar fallos para superar el umbral y abrir el breaker
    for (let i = 0; i < 5; i++) {
      try {
        await middlewareBreaker.fire();
      } catch (err) {
        // Error esperado
      }
    }

    // Esperar a que el breaker se abra
    await new Promise(resolve => setTimeout(resolve, 200));

    // Verificar que el breaker está abierto
    expect(middlewareBreaker.opened).toBe(true);

    const response = await request(app).get('/test');
    expect(response.status).toBe(HTTP.SERVICE_UNAVAILABLE);
    expect(response.body).toEqual({ message: ERROR_MESSAGES.SERVICE_UNAVAILABLE });
  });

  afterEach(() => {
    // Restaurar mocks al finalizar cada test
    jest.restoreAllMocks();
  });
});
