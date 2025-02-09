export const CACHE_KEYS = {
    PRODUCTS: {
      ALL: 'products:all',
      ACTIVE: 'products:active',
      BY_ID: (id: string) => `product:${id}`
    }
  };