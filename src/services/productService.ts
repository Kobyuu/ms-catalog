import { Transaction } from "sequelize";
import Product from "../models/Product.model";
import db from "../config/db";
import { DATABASE, MODEL_FIELDS } from "../config/constants";
import { ERROR_MESSAGES } from "../config/constants/messages";
import { axiosInstance } from "../config/constants/axiosClient";
import { ProductCreateInput, ProductUpdateInput, ProductAttributes } from "../types/product.types";

export class ProductService {
  // Utilidad para manejar transacciones de base de datos
  private static async withTransaction<T>(operation: (transaction: Transaction) => Promise<T>): Promise<T> {
    const transaction = await db.transaction();
    try {
      const result = await operation(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Obtener todos los productos desde la base de datos
  static async getAllProducts(): Promise<ProductAttributes[]> {
    return await Product.findAll({
      order: [[DATABASE.SORT_CONFIG.FIELD, DATABASE.SORT_CONFIG.ORDER]],
      attributes: { exclude: DATABASE.EXCLUDED_ATTRIBUTES },
    });
  }

  // Buscar un producto específico por su ID
  static async getProductById(id: string): Promise<ProductAttributes> {
    const product = await Product.findByPk(id, {
      attributes: { exclude: DATABASE.EXCLUDED_ATTRIBUTES },
    });
    if (!product) {
      throw new Error(ERROR_MESSAGES.NOT_FOUND);
    }
    return product;
  }

  // Obtener datos de productos desde una API externa
  static async getExternalProducts(apiUrl: string): Promise<any> {
    try {
      const response = await axiosInstance.get(apiUrl);
      return response.data;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.EXTERNAL_API_ERROR);
    }
  }

  // Crear un nuevo producto en la base de datos
  static async createProduct(productData: ProductCreateInput): Promise<ProductAttributes> {
    return ProductService.withTransaction(async (transaction) => {
      const product = await Product.create(productData, { transaction });
      return product;
    });
  }

  // Actualizar un producto existente
  static async updateProduct(id: string, productData: ProductUpdateInput): Promise<ProductAttributes> {
    return ProductService.withTransaction(async (transaction) => {
      const product = await Product.findByPk(id, { transaction });
      if (!product) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }
      await product.update(productData, { transaction });
      return product;
    });
  }

  // Alternar el estado de activación de un producto
  static async toggleActivate(id: string): Promise<ProductAttributes> {
    return ProductService.withTransaction(async (transaction) => {
      const product = await Product.findByPk(id, { transaction });
      if (!product) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }
      product.activate = !product.activate;
      await product.save({ transaction });
      return product;
    });
  }

  // Eliminar un producto (borrado lógico)
  static async deleteProduct(id: string): Promise<void> {
    return ProductService.withTransaction(async (transaction) => {
      const product = await Product.findByPk(id, { transaction });
      if (!product) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }
      await product.update({ activate: false }, { transaction });
    });
  }
}