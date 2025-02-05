
import type { ProductAttributes, ProductResponse } from "../types/product.types";
import { ERROR_MESSAGES } from "../config/constants/";

// Utilidades para manejar productos
export class ProductUtils {
  static validateProductData(data: Partial<ProductAttributes>): { isValid: boolean; error?: string } {
    if (!data.name || data.name.trim().length === 0) {
      return { isValid: false, error: ERROR_MESSAGES.INVALID_NAME };
    }
    if (!data.price || data.price <= 0) {
      return { isValid: false, error: ERROR_MESSAGES.INVALID_PRICE };
    }
    return { isValid: true };
  }
// Formatear la respuesta de un producto
  static formatProductResponse(product: ProductAttributes) {
    const { createdAt, updatedAt, ...productData } = product;
    return productData;
  }
// Validar si un producto está activo
  static isProductActive(product: ProductAttributes): boolean {
    return product.activate;
  }
// Formatear la respuesta de un error
  static formatErrorResponse(error: Error, message: string): ProductResponse {
    return {
      error: message,
      statusCode: error.message === ERROR_MESSAGES.NOT_FOUND ? 404 : 500
    };
  }
}