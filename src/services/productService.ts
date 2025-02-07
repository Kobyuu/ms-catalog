import { Transaction } from "sequelize";
import CircuitBreaker from 'opossum';
import Product from "../models/Product.model";
import db from "../config/db";
import { DATABASE, ERROR_MESSAGES, HTTP, CIRCUIT_BREAKER_MESSAGES } from "../config/constants";
import { cacheService } from '../services/redisCacheService';
import { ProductCreateInput, ProductUpdateInput, ProductAttributes } from "../types/product.types";
import { ProductUtils } from '../utils/productUtils';

const breakerOptions = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
};

export class CustomError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'CustomError';
  }
}

export class ProductService {
  private static breakers: { [key: string]: CircuitBreaker } = {};

  private static getBreaker(operationName: string, operation: (...args: unknown[]) => Promise<unknown>): CircuitBreaker {
    if (!this.breakers[operationName]) {
      const breaker = new CircuitBreaker(operation, breakerOptions);
      
      breaker.fallback(() => {
        throw new CustomError(
          HTTP.SERVICE_UNAVAILABLE, 
          ERROR_MESSAGES.SERVICE_UNAVAILABLE
        );
      });

      breaker.on('open', () => console.log(`${operationName}: ${CIRCUIT_BREAKER_MESSAGES.OPEN}`));
      breaker.on('halfOpen', () => console.log(`${operationName}: ${CIRCUIT_BREAKER_MESSAGES.HALF_OPEN}`));
      breaker.on('close', () => console.log(`${operationName}: ${CIRCUIT_BREAKER_MESSAGES.CLOSED}`));

      this.breakers[operationName] = breaker;
    }
    return this.breakers[operationName];
  }

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

  static async getAllProducts(): Promise<ProductAttributes[]> {
    const breaker = this.getBreaker('getAllProducts', async () => {
      const cacheKey = 'products:all';
      try {
        const cachedProducts = await cacheService.getFromCache(cacheKey);
        if (cachedProducts) {
          console.log('Returning cached products');
          return cachedProducts;
        }

        console.log('Fetching products from DB');
        const dbProducts = await Product.findAll({
          order: [[DATABASE.SORT_CONFIG.FIELD, DATABASE.SORT_CONFIG.ORDER]],
          attributes: { exclude: DATABASE.EXCLUDED_ATTRIBUTES },
          raw: true
        });

        if (dbProducts.length > 0) {
          console.log('Updating cache with DB products');
          await cacheService.setToCache(cacheKey, dbProducts);
        }

        return dbProducts;
      } catch (error) {
        console.error('Error in getAllProducts:', error);
        if (error instanceof Error) {
          throw new CustomError(500, error.message);
        }
        throw new CustomError(500, ERROR_MESSAGES.FETCH_ERROR);
      }
    });

    return breaker.fire() as Promise<ProductAttributes[]>;
  }

  static async getProductById(id: string): Promise<ProductAttributes> {
    const breaker = this.getBreaker('getProductById', async () => {
      const product = await Product.findByPk(id, {
        attributes: { exclude: DATABASE.EXCLUDED_ATTRIBUTES },
      });
      if (!product) {
        throw new CustomError(404, ERROR_MESSAGES.NOT_FOUND);
      }
      return product;
    });

    return breaker.fire() as Promise<ProductAttributes>;
  }

  static async createProduct(productData: ProductCreateInput): Promise<ProductAttributes> {
    const breaker = this.getBreaker('createProduct', async () => {
      return this.withTransaction(async (transaction) => {
        const product = await Product.create(productData, { transaction });
        await cacheService.clearCache(['products:all']);
        return product;
      });
    });

    return breaker.fire() as Promise<ProductAttributes>;
  }

  static async updateProduct(id: string, productData: ProductUpdateInput): Promise<ProductAttributes> {
    const breaker = this.getBreaker('updateProduct', async () => {
      const validation = ProductUtils.validateProductData(productData);
      if (!validation.isValid) {
        throw new CustomError(400, validation.error || ERROR_MESSAGES.INVALID_DATA);
      }

      return this.withTransaction(async (transaction) => {
        const product = await Product.findByPk(id, { transaction });
        if (!product) {
          throw new CustomError(404, ERROR_MESSAGES.NOT_FOUND);
        }
        await product.update(productData, { transaction });
        await cacheService.clearCache(['products:all', `product:${id}`]);
        return product;
      });
    });

    return breaker.fire() as Promise<ProductAttributes>;
  }

  static async toggleActivate(id: string): Promise<ProductAttributes> {
    const breaker = this.getBreaker('toggleActivate', async () => {
      return this.withTransaction(async (transaction) => {
        const product = await Product.findByPk(id, { transaction });
        if (!product) {
          throw new CustomError(404, ERROR_MESSAGES.NOT_FOUND);
        }

        const newStatus = !product.activate;
        await product.update({ activate: newStatus }, { transaction });
        
        await cacheService.clearCache([
          'products:all',
          `product:${id}`,
          'products:active'
        ]);

        return product;
      });
    });

    return breaker.fire() as Promise<ProductAttributes>;
  }
}