import rateLimit from 'express-rate-limit';
import { HTTP } from '../config/constants/httpStatus';

// Configuración del rate limiter
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 100, // Límite de 100 peticiones por IP
  message: {
    error: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente en 15 minutos',
    statusCode: HTTP.SERVER_ERROR
  },
  standardHeaders: true, // Incluye headers estándar de rate limit
  legacyHeaders: false // Deshabilita los headers antiguos
});

export { rateLimiter };