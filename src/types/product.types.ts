// Interfaz que define los atributos del modelo Producto
export interface ProductAttributes {
    id?: number;
    name: string;
    price: number;
    activate: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
// Interfaz que define la respuesta de la API
  export interface ProductResponse {
    data?: ProductAttributes | ProductAttributes[];
    message?: string;
    error?: string;
    statusCode?: number;
  }
// Tipo para crear nuevos productos (omitiendo campos autogenerados)
  export type ProductCreateInput = Omit<ProductAttributes, 'id' | 'createdAt' | 'updatedAt'>;
  
// Tipo para actualizar productos (permitiendo campos parciales)
  export type ProductUpdateInput = Partial<ProductCreateInput>;