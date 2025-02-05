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
  console.error(error);
  const statusCode = error.message === ERROR_MESSAGES.NOT_FOUND ? HTTP.NOT_FOUND : HTTP.SERVER_ERROR;
  res.status(statusCode).json(ProductUtils.formatErrorResponse(error, defaultMessage));
}