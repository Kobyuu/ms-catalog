// Clase para manejar errores personalizados
export class CustomError extends Error {
    constructor(public statusCode: number, message: string) {
      super(message);
      this.name = 'CustomError';
    }
  }
  