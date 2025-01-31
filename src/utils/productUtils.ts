import { MODEL_FIELDS } from "../config/constants";
import type { ProductAttributes, ProductResponse } from "../types/product.types";
import { ERROR_MESSAGES } from "../config/constants/messages";

export class ProductUtils {
  static validateProductData(data: Partial<ProductAttributes>): boolean {
    return !!(data.name && data.price && data.price > 0);
  }

  static formatProductResponse(product: ProductAttributes) {
    const { createdAt, updatedAt, ...productData } = product;
    return productData;
  }

  static isProductActive(product: ProductAttributes): boolean {
    return product[MODEL_FIELDS.ACTIVATE];
  }

  static formatErrorResponse(error: Error, message: string): ProductResponse {
    return {
      error: message,
      statusCode: error.message === ERROR_MESSAGES.NOT_FOUND ? 404 : 500
    };
  }
}