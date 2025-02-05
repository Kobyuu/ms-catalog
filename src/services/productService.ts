import { Transaction } from "sequelize";
import Product from "../models/Product.model";
import db from "../config/db";
import { DATABASE, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../config/constants";
import { axiosInstance } from "../config/axiosClient";
import { ProductCreateInput, ProductUpdateInput, ProductAttributes } from "../types/product.types";
import { ProductUtils } from '../utils/productUtils';

export class CustomError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'CustomError';
  }
}

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
    try {
      const products = await Product.findAll({
        order: [[DATABASE.SORT_CONFIG.FIELD, DATABASE.SORT_CONFIG.ORDER]],
        attributes: { exclude: DATABASE.EXCLUDED_ATTRIBUTES },
      });
      return products;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.FETCH_ERROR);
    }
  }

  // Buscar un producto específico por su ID
  static async getProductById(id: string): Promise<ProductAttributes> {
    const product = await Product.findByPk(id, {
      attributes: { exclude: DATABASE.EXCLUDED_ATTRIBUTES },
    });
    if (!product) {
      throw new CustomError(404, ERROR_MESSAGES.NOT_FOUND);
    }
    return product;
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
    const validation = ProductUtils.validateProductData(productData);
    if (!validation.isValid) {
      throw new CustomError(400, validation.error || ERROR_MESSAGES.INVALID_DATA);
    }
    // Actualiza el producto en la base de datos
    return ProductService.withTransaction(async (transaction) => {
      const product = await Product.findByPk(id, { transaction });
      if (!product) {
        throw new CustomError(404, ERROR_MESSAGES.NOT_FOUND);
      }
      await product.update(productData, { transaction });
      return product;
    });
  }

  // Alternar el estado de activación de un producto
  static async toggleActivate(id: string): Promise<ProductAttributes> {
    const transaction = await db.transaction(); // Inicia la transacción manualmente
  
    try {
      const product = await Product.findByPk(id, { transaction });
      if (!product) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }
  
      const newStatus = !product.activate;
      await product.update({ activate: newStatus }, { transaction });
  
      await transaction.commit(); // Confirma la transacción
      return product.reload();
    } catch (error) {
      await transaction.rollback(); // Revierte la transacción en caso de error
      throw error;
    }
  }
}