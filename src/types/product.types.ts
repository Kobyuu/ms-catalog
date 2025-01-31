/**
 * Interfaz que define los atributos del modelo Producto
 * Incluye campos opcionales como id y timestamps
 */
export interface ProductAttributes {
    id?: number;
    name: string;
    price: number;
    activate: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  /**
   * Interfaz para las respuestas HTTP de la API
   * Permite enviar datos, mensajes y errores estructurados
   */
  export interface ProductResponse {
    data?: ProductAttributes | ProductAttributes[];
    message?: string;
    error?: string;
    statusCode?: number;
  }
  
  /**
   * Tipo para crear nuevos productos
   * Excluye campos autogenerados (id, createdAt, updatedAt)
   */
  export type ProductCreateInput = Omit<ProductAttributes, 'id' | 'createdAt' | 'updatedAt'>;
  
  /**
   * Tipo para actualizar productos existentes
   * Hace todos los campos opcionales
   */
  export type ProductUpdateInput = Partial<ProductCreateInput>;