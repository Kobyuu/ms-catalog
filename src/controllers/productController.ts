import { Request, Response } from "express";
import { ProductService } from "../services/productService";
import { HTTP } from "../config/constants/httpStatus";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../config/constants/messages";
import { ProductUtils } from "../utils/productUtils";
import type { ProductCreateInput, ProductUpdateInput, ProductResponse } from "../types/product.types";

export class ProductController {
  private static handleError(res: Response, error: Error, defaultMessage: string) {
    console.error(error);
    const statusCode = error.message === ERROR_MESSAGES.NOT_FOUND 
      ? HTTP.NOT_FOUND 
      : HTTP.SERVER_ERROR;
    return res.status(statusCode).json(
      ProductUtils.formatErrorResponse(error, defaultMessage)
    );
  }

  static async getProducts(req: Request, res: Response): Promise<Response<ProductResponse>> {
    try {
      const products = await ProductService.getAllProducts();
      return res.json({
        data: products,
        message: SUCCESS_MESSAGES.PRODUCTS_FETCHED
      });
    } catch (error) {
      return this.handleError(res, error as Error, ERROR_MESSAGES.FETCH_ERROR);
    }
  }

  static async getProductById(req: Request, res: Response): Promise<Response<ProductResponse>> {
    const { id } = req.params;
    try {
      const product = await ProductService.getProductById(id);
      if (!product) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }
      return res.json({
        data: product,
        message: SUCCESS_MESSAGES.PRODUCT_FETCHED
      });
    } catch (error) {
      return this.handleError(res, error as Error, ERROR_MESSAGES.FETCH_ONE_ERROR);
    }
  }

  static async createProduct(req: Request, res: Response): Promise<Response<ProductResponse>> {
    try {
      console.log('Creating product:', req.body);
      const product = res.locals.result || await ProductService.createProduct(req.body);
      console.log('Product created successfully:', product);
      return res.status(HTTP.CREATED).json({
        data: product,
        message: SUCCESS_MESSAGES.PRODUCT_CREATED
      });
    } catch (error) {
      console.error('Error creating product:', error);
      return this.handleError(res, error as Error, ERROR_MESSAGES.CREATION_ERROR);
    }
  }

  static async updateProduct(req: Request, res: Response): Promise<Response<ProductResponse>> {
    const { id } = req.params;
    try {
      const productData: ProductUpdateInput = req.body;
      const product = await ProductService.updateProduct(id, productData);
      return res.json({
        data: product,
        message: SUCCESS_MESSAGES.PRODUCT_UPDATED
      });
    } catch (error) {
      return this.handleError(res, error as Error, ERROR_MESSAGES.UPDATE_ERROR);
    }
  }

  static async updateActivate(req: Request, res: Response): Promise<Response<ProductResponse>> {
    const { id } = req.params;
    try {
      const product = await ProductService.toggleActivate(id);
      return res.json({
        data: product,
        message: SUCCESS_MESSAGES.PRODUCT_ACTIVATED
      });
    } catch (error) {
      return this.handleError(res, error as Error, ERROR_MESSAGES.ACTIVATE_ERROR);
    }
  }
}