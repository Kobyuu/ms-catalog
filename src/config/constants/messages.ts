export const ERROR_MESSAGES = {
  DUPLICATE_NAME: "Ya existe un producto con este nombre",
  NOT_FOUND: "Producto no encontrado",
  CREATION_ERROR: "Error al crear el producto",
  FETCH_ERROR: "Error al obtener los productos",
  FETCH_ONE_ERROR: "Error al obtener el producto",
  ACTIVATE_FIELD_MISSING: "El campo 'activate' no existe en el producto",
  UPDATE_ERROR: "Error al actualizar el producto",
  ACTIVATE_ERROR: "Error al activar/desactivar el producto",
  
  INVALID_ID: "El ID debe ser un número entero",
  EMPTY_NAME: "El nombre del producto es requerido",
  INVALID_PRICE: "El precio debe ser un valor numérico válido",
  EMPTY_PRICE: "El precio es requerido",
  PRICE_POSITIVE: "El precio debe ser mayor a 0",
  INVALID_AVAILABILITY: "La disponibilidad debe ser un valor verdadero o falso",

  DB_URL_NOT_DEFINED: "DATABASE_URL no está definida en las variables de entorno",
  DB_CONNECTION: "Error al conectar la base de datos"

};

export const SUCCESS_MESSAGES = {
    PRODUCT_CREATED: "Producto creado exitosamente",
    PRODUCT_UPDATED: "Producto actualizado exitosamente",
    PRODUCT_FETCHED: "Producto obtenido exitosamente",
    PRODUCTS_FETCHED: "Productos obtenidos exitosamente",
    PRODUCT_ACTIVATED: "Estado del producto actualizado exitosamente",
    DB_CONNECTION: "Conexión exitosa a la base de datos"
};