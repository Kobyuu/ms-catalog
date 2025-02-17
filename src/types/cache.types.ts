// Interfaz que define operaciones básicas de caché
export interface CacheService {
    getFromCache(key: string): Promise<any>;
    setToCache(key: string, data: any): Promise<void>;
    clearCache(keys: string[]): Promise<void>;
  }
  // Interfaz que define operaciones básicas de base de datos
  export interface DatabaseService {
    transaction<T>(): Promise<T>;
  }