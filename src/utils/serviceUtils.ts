import { Response } from 'express';
import { HTTP, ERROR_MESSAGES } from '../config/constants';
import { ProductUtils } from '../utils/productUtils';

// Función para ejecutar operación de servicio
export async function executeServiceOperation(
  res: Response,
  operation: () => Promise<any>,
  successMessage: string,
  errorMessage: string,
  statusCode: number = HTTP.OK
): Promise<void> {
  try {
    const result = await operation();
    sendSuccess(res, result, successMessage, statusCode);
  } catch (error) {
    handleError(res, error as Error, errorMessage);
  }
}
// Función para enviar respuesta exitosa
function sendSuccess(res: Response, data: any, message: string, statusCode: number = HTTP.OK): void {
  res.status(statusCode).json({
    data,
    message
  });
}
// Función para manejar errores
function handleError(res: Response, error: Error, defaultMessage: string): void {
  if (process.env.NODE_ENV !== 'test') {
    console.error(error);
  }
  // Si ya se enviaron los headers, no se hace nada.
  if (res.headersSent) {
    return;
  }

  // Si el error tiene una propiedad statusCode (por ejemplo, un CustomError)
  const statusCode = (error as any).statusCode || HTTP.SERVER_ERROR;

  // Usamos el mensaje del error si existe, de lo contrario usamos el mensaje por defecto.
  const message = (error as any).message || defaultMessage;

  res.status(statusCode).json(ProductUtils.formatErrorResponse(error, message));
}

