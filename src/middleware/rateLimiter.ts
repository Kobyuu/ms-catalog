import rateLimit from 'express-rate-limit';
import { HTTP,ERROR_MESSAGES } from '../config/constants/';

// Configuración del rate limiter
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100000, // Limite de 100 solicitudes por IP
  message: {
    error: ERROR_MESSAGES.RATE_LIMIT,
    statusCode: HTTP.SERVER_ERROR
  }
});

export { rateLimiter };