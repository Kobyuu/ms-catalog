import { Transaction } from "sequelize";
import Product from "../models/Product.model";
import db from "../config/db";
import { DATABASE, MODEL_FIELDS, ENV } from "../config/constants";
import axios from 'axios';
import axiosRetry from 'axios-retry';

export class ProductService {
  private static axiosInstance = axios.create();

  static {
    axiosRetry(this.axiosInstance, { 
      retries: ENV.RETRY_LIMIT,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.code === 'ECONNABORTED';
      }
    });
  }

  static async withRetries<T>(action: () => Promise<T>): Promise<T> {
    let lastError;
    for (let attempt = 0; attempt < ENV.RETRY_LIMIT; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error;
        if (attempt < ENV.RETRY_LIMIT - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    throw lastError;
  }

  static async getAllProducts() {
    return await this.withRetries(async () => {
      return await Product.findAll({
        order: [[DATABASE.SORT_CONFIG.FIELD, DATABASE.SORT_CONFIG.ORDER]],
        attributes: { exclude: DATABASE.EXCLUDED_ATTRIBUTES },
      });
    });
  }

  static async getProductById(id: string) {
    return await this.withRetries(async () => {
      return await Product.findByPk(id, {
        attributes: { exclude: DATABASE.EXCLUDED_ATTRIBUTES },
      });
    });
  }

  static async findProductByName(name: string) {
    return await this.withRetries(async () => {
      return await Product.findOne({ 
        where: { [MODEL_FIELDS.NAME]: name } 
      });
    });
  }

  static async createProduct(productData: any) {
    return await this.withRetries(async () => {
      const transaction: Transaction = await db.transaction();
      try {
        const product = await Product.create(productData, { transaction });
        await transaction.commit();
        return product;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    });
  }

  static async updateProduct(id: string, productData: any) {
    return await this.withRetries(async () => {
      const transaction: Transaction = await db.transaction();
      try {
        const product = await Product.findByPk(id, { transaction });
        if (!product) {
          throw new Error("Producto no encontrado");
        }
        await product.update(productData, { transaction });
        await transaction.commit();
        return product;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    });
  }

  static async toggleActivate(id: string) {
    return await this.withRetries(async () => {
      const transaction: Transaction = await db.transaction();
      try {
        const product = await Product.findByPk(id, { transaction });
        if (!product) {
          throw new Error("Producto no encontrado");
        }
        product.activate = !product.activate;
        await product.save({ transaction });
        await transaction.commit();
        return product;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    });
  }
}