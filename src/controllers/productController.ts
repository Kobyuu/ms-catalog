import { Request, Response } from "express";
import { Transaction } from "sequelize";
import Product from "../models/Product.model";
import db from "../config/db";
import { 
  ERROR_MESSAGES, 
  DATABASE, 
  MODEL_FIELDS,
  HTTP,
  ENV 
} from "../config/constants";

class ProductController {
  static async withRetries(action: () => Promise<any>, retries: number = ENV.RETRY_LIMIT): Promise<any> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await action();
      } catch (error) {
        attempt++;
        if (attempt >= retries) {
          throw error;
        }
      }
    }
  }

  static async getProducts(req: Request, res: Response): Promise<Response> {
    try {
      const result = await ProductController.withRetries(async () => {
        // En el método getProducts y donde sea que uses el ordenamiento
      const products = await Product.findAll({
        order: [[DATABASE.SORT_CONFIG.FIELD, DATABASE.SORT_CONFIG.ORDER]], // Cambiado de SORT a SORT_CONFIG
        attributes: { exclude: DATABASE.EXCLUDED_ATTRIBUTES },
      });
        console.log("Productos obtenidos de la base de datos");
        return products;
      });
      return res.json({ data: result });
    } catch (error) {
      console.error(error);
      return res.status(HTTP.SERVER_ERROR).json({ 
        error: ERROR_MESSAGES.FETCH_ERROR 
      });
    }
  }

  static async getProductById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const result = await ProductController.withRetries(async () => {
        const product = await Product.findByPk(id, {
          attributes: { exclude: DATABASE.EXCLUDED_ATTRIBUTES },
        });
        if (product) {
          console.log("Producto obtenido de la base de datos");
        }
        return product;
      });
      if (result) {
        return res.json({ data: result });
      }
      return res.status(HTTP.NOT_FOUND).json({ 
        error: ERROR_MESSAGES.NOT_FOUND 
      });
    } catch (error) {
      console.error(error);
      return res.status(HTTP.SERVER_ERROR).json({ 
        error: ERROR_MESSAGES.FETCH_ONE_ERROR 
      });
    }
  }

  static async createProduct(req: Request, res: Response): Promise<Response> {
    try {
      const { name } = req.body;

      const existingProduct = await Product.findOne({ 
        where: { [MODEL_FIELDS.NAME]: name } 
      });
      if (existingProduct) {
        return res.status(HTTP.BAD_REQUEST).json({ 
          error: ERROR_MESSAGES.DUPLICATE_NAME 
        });
      }

      const result = await ProductController.withRetries(async () => {
        const transaction: Transaction = await db.transaction();
        try {
          const product = await Product.create(req.body, { transaction });
          await transaction.commit();
          console.log("Producto creado");
          return product;
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
      });

      return res.status(HTTP.CREATED).json({ data: result });
    } catch (error) {
      console.error(error);
      return res.status(HTTP.SERVER_ERROR).json({ 
        error: ERROR_MESSAGES.CREATION_ERROR 
      });
    }
  }

  static async updateProduct(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const result = await ProductController.withRetries(async () => {
        const transaction: Transaction = await db.transaction();
        try {
          const product = await Product.findByPk(id, { transaction });
          if (!product) {
            throw new Error(ERROR_MESSAGES.NOT_FOUND);
          }
          await product.update(req.body, { transaction });
          await transaction.commit();
          console.log(`Producto ${id} actualizado`);
          return product;
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
      });
      return res.json({ data: result });
    } catch (error) {
      const statusCode = error.message === ERROR_MESSAGES.NOT_FOUND 
        ? HTTP.NOT_FOUND 
        : HTTP.SERVER_ERROR;
      console.error(error);
      return res.status(statusCode).json({ error: error.message });
    }
  }

  static async updateActivate(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const result = await ProductController.withRetries(async () => {
        const transaction: Transaction = await db.transaction();
        try {
          const product = await Product.findByPk(id, { transaction });
          if (!product) {
            throw new Error(ERROR_MESSAGES.NOT_FOUND);
          }
          if (!(MODEL_FIELDS.ACTIVATE in product.dataValues)) {
            throw new Error(ERROR_MESSAGES.ACTIVATE_FIELD_MISSING);
          }
          product.activate = !product.dataValues.activate;
          await product.save({ transaction });
          await transaction.commit();
          console.log(`Producto ${id} activado/desactivado`);
          return product;
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
      });
      return res.json({ data: result });
    } catch (error) {
      const statusCode = error.message === ERROR_MESSAGES.NOT_FOUND 
        ? HTTP.NOT_FOUND 
        : HTTP.SERVER_ERROR;
      console.error(error);
      return res.status(statusCode).json({ error: error.message });
    }
  }
}

export default ProductController;