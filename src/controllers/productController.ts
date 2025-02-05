import { Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { ProductUpdateInput } from '../types/product.types';
import { HTTP, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import { executeServiceOperation } from '../utils/serviceUtils';

export class ProductController {
  // Obtener todos los productos
  static async getProducts(req: Request, res: Response): Promise<void> {
    await executeServiceOperation(
      res,
      () => ProductService.getAllProducts(),
      SUCCESS_MESSAGES.PRODUCTS_FETCHED,
      ERROR_MESSAGES.FETCH_ERROR
    );
  }

  // Obtener un producto por ID
  static async getProductById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await executeServiceOperation(
      res,
      async () => {
        const product = await ProductService.getProductById(id);
        if (!product) throw new Error(ERROR_MESSAGES.NOT_FOUND);
        return product;
      },
      SUCCESS_MESSAGES.PRODUCT_FETCHED,
      ERROR_MESSAGES.FETCH_ONE_ERROR
    );
  }

  // Crear un producto
  static async createProduct(req: Request, res: Response): Promise<void> {
    await executeServiceOperation(
      res,
      () => res.locals.result || ProductService.createProduct(req.body),
      SUCCESS_MESSAGES.PRODUCT_CREATED,
      ERROR_MESSAGES.CREATION_ERROR,
      HTTP.CREATED
    );
  }

  // Actualizar un producto
  static async updateProduct(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const productData: ProductUpdateInput = req.body;
    await executeServiceOperation(
      res,
      () => ProductService.updateProduct(id, productData),
      SUCCESS_MESSAGES.PRODUCT_UPDATED,
      ERROR_MESSAGES.UPDATE_ERROR
    );
  }

  // Alternar el estado de activación de un producto
  static async updateActivate(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await executeServiceOperation(
      res,
      () => res.locals.result || ProductService.toggleActivate(id),
      SUCCESS_MESSAGES.PRODUCT_UPDATED,
      ERROR_MESSAGES.UPDATE_ERROR
    );
  }
}