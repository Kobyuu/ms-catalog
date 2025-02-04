import { Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { HTTP } from '../config/constants/';

// Middleware para manejar errores de validación de entrada
export const handleInputErrors: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(HTTP.BAD_REQUEST).json({ errors: errors.array() });
    return;
  }
  next();
};