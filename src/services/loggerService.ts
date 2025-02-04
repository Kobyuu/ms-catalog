import { createLogger, format, transports } from 'winston';
import { ENV } from '../config/constants';

const { combine, timestamp, printf, colorize } = format;

const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Servicio de logs
export class LoggerService {
  private static instance = createLogger({
    level: ENV.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
      timestamp(),
      colorize(),
      customFormat
    ),
    // Configuración de los transportes de logs
    transports: [
      new transports.Console(),
      new transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      new transports.File({ 
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    ]
  });

// Métodos para loggear mensajes de diferentes niveles
  static info(message: string): void {
    this.instance.info(message);
  }

  static error(message: string, error?: Error): void {
    if (error) {
      this.instance.error(`${message}: ${error.message}`, {
        stack: error.stack,
        name: error.name
      });
    } else {
      this.instance.error(message);
    }
  }
  static warn(message: string): void {
    this.instance.warn(message);
  }

  static debug(message: string): void {
    this.instance.debug(message);
  }
}