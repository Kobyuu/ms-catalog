import { Transaction } from "sequelize";
import Product from "../models/Product.model";
import db from "../config/db";
import { DATABASE, ERROR_MESSAGES, HTTP, LOG_MESSAGES, CACHE_KEYS, CIRCUIT_OPERATIONS } from "../config/constants";
import { cacheService } from '../services/redisCacheService';
import { ProductCreateInput, ProductUpdateInput, ProductAttributes } from "../types/product.types";
import { ProductUtils } from '../utils/productUtils';
import { CircuitBreakerService } from '../middleware/circuitBreaker';
import { CustomError } from '../utils/CustomError';

export class ProductService {
  // Método para realizar operaciones con transacciones
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
// Obtener la lista de todos los productos
  static async getAllProducts(): Promise<ProductAttributes[]> {
    const breaker = CircuitBreakerService.getBreaker(CIRCUIT_OPERATIONS.PRODUCTS.GET_ALL, async () => {
      try {
        const cachedProducts = await cacheService.getFromCache(CACHE_KEYS.PRODUCTS.ALL);
        if (cachedProducts) {
          console.log(LOG_MESSAGES.CACHE.RETURNING);
          return cachedProducts;
        }

        console.log(LOG_MESSAGES.CACHE.FETCHING);
        const dbProducts = await Product.findAll({
          order: [[DATABASE.SORT_CONFIG.FIELD, DATABASE.SORT_CONFIG.ORDER]],
          attributes: { exclude: DATABASE.EXCLUDED_ATTRIBUTES },
          raw: true
        });

        if (dbProducts.length > 0) {
          console.log(LOG_MESSAGES.CACHE.UPDATING);
          await cacheService.setToCache(CACHE_KEYS.PRODUCTS.ALL, dbProducts);
        }

        return dbProducts;
      } catch (error) {
        console.error(LOG_MESSAGES.ERROR.GET_ALL, error);
        if (error instanceof Error) {
          throw new CustomError(HTTP.SERVER_ERROR, error.message);
        }
        throw new CustomError(HTTP.SERVER_ERROR, ERROR_MESSAGES.FETCH_ERROR);
      }
    });

    return breaker.fire() as Promise<ProductAttributes[]>;
  }

  static async getProductById(id: string): Promise<ProductAttributes> {
    const breaker = CircuitBreakerService.getBreaker(CIRCUIT_OPERATIONS.PRODUCTS.GET_BY_ID, async () => {
      const product = await Product.findByPk(id, {
        attributes: { exclude: DATABASE.EXCLUDED_ATTRIBUTES },
      });
      if (!product) {
        throw new CustomError(HTTP.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      }
      return product;
    });

    return breaker.fire() as Promise<ProductAttributes>;
  }

  static async createProduct(productData: ProductCreateInput): Promise<ProductAttributes> {
    const breaker = CircuitBreakerService.getBreaker(CIRCUIT_OPERATIONS.PRODUCTS.CREATE, async () => {
      return this.withTransaction(async (transaction) => {
        const product = await Product.create(productData, { transaction });
        await cacheService.clearCache([CACHE_KEYS.PRODUCTS.ALL]);
        return product;
      });
    });

    return breaker.fire() as Promise<ProductAttributes>;
  }

  static async updateProduct(id: string, productData: ProductUpdateInput): Promise<ProductAttributes> {
    const breaker = CircuitBreakerService.getBreaker(CIRCUIT_OPERATIONS.PRODUCTS.UPDATE, async () => {
      const validation = ProductUtils.validateProductData(productData);
      if (!validation.isValid) {
        throw new CustomError(HTTP.BAD_REQUEST, validation.error || ERROR_MESSAGES.INVALID_DATA);
      }

      return this.withTransaction(async (transaction) => {
        const product = await Product.findByPk(id, { transaction });
        if (!product) {
          throw new CustomError(HTTP.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
        }
        await product.update(productData, { transaction });
        await cacheService.clearCache([
          CACHE_KEYS.PRODUCTS.ALL,
          CACHE_KEYS.PRODUCTS.BY_ID(id)
        ]);
        return product;
      });
    });

    return breaker.fire() as Promise<ProductAttributes>;
  }

  static async toggleActivate(id: string): Promise<ProductAttributes> {
    const breaker = CircuitBreakerService.getBreaker(CIRCUIT_OPERATIONS.PRODUCTS.TOGGLE, async () => {
      return this.withTransaction(async (transaction) => {
        const product = await Product.findByPk(id, { transaction });
        if (!product) {
          throw new CustomError(HTTP.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
        }

        const newStatus = !product.activate;
        await product.update({ activate: newStatus }, { transaction });
        
        await cacheService.clearCache([
          CACHE_KEYS.PRODUCTS.ALL,
          CACHE_KEYS.PRODUCTS.BY_ID(id),
          CACHE_KEYS.PRODUCTS.ACTIVE
        ]);

        return product;
      });
    });

    return breaker.fire() as Promise<ProductAttributes>;
  }
}