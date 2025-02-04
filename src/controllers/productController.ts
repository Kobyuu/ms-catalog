import { Request, Response } from "express";
import { ProductService } from "../services/productService";
import { HTTP } from "../config/constants/httpStatus";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../config/constants/";
import { ProductUtils } from "../utils/productUtils";
import type { ProductUpdateInput } from "../types/product.types";

export class ProductController {
  // Maneja los errores de la aplicación y envía una respuesta apropiada
  private static handleError(res: Response, error: Error, defaultMessage: string): void {
    console.error(error);
    const statusCode = error.message === ERROR_MESSAGES.NOT_FOUND 
      ? HTTP.NOT_FOUND 
      : HTTP.SERVER_ERROR;
    res.status(statusCode).json(
      ProductUtils.formatErrorResponse(error, defaultMessage)
    );
  }

  // Obtener todos los productos disponibles
  static async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await ProductService.getAllProducts();
      res.json({
        data: products,
        message: SUCCESS_MESSAGES.PRODUCTS_FETCHED
      });
    } catch (error) {
      this.handleError(res, error as Error, ERROR_MESSAGES.FETCH_ERROR);
    }
  }

  // Obtener un producto por ID
  static async getProductById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const product = await ProductService.getProductById(id);
      if (!product) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }
      res.json({
        data: product,
        message: SUCCESS_MESSAGES.PRODUCT_FETCHED
      });
    } catch (error) {
      this.handleError(res, error as Error, ERROR_MESSAGES.FETCH_ONE_ERROR);
    }
  }

  // Crear un producto
  static async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = res.locals.result || await ProductService.createProduct(req.body);
      res.status(HTTP.CREATED).json({
        data: product,
        message: SUCCESS_MESSAGES.PRODUCT_CREATED
      });
    } catch (error) {
      this.handleError(res, error as Error, ERROR_MESSAGES.CREATION_ERROR);
    }
  }

  // Actualizar un producto
  static async updateProduct(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const productData: ProductUpdateInput = req.body;
      const product = await ProductService.updateProduct(id, productData);
      res.json({
        data: product,
        message: SUCCESS_MESSAGES.PRODUCT_UPDATED
      });
    } catch (error) {
      this.handleError(res, error as Error, ERROR_MESSAGES.UPDATE_ERROR);
    }
  }

  // Activar o desactivar un producto
  static async updateActivate(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const product = await ProductService.toggleActivate(id);
      res.json({
        data: product,
        message: SUCCESS_MESSAGES.PRODUCT_ACTIVATED
      });
    } catch (error) {
      this.handleError(res, error as Error, ERROR_MESSAGES.ACTIVATE_ERROR);
    }
  }
}