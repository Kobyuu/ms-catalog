export interface CacheService {
    getFromCache(key: string): Promise<any>;
    setToCache(key: string, data: any): Promise<void>;
    clearCache(keys: string[]): Promise<void>;
  }
  
  export interface DatabaseService {
    transaction<T>(): Promise<T>;
  }