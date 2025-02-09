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
  INVALID_NAME: "El nombre del producto es inválido",
  INVALID_PRICE: "El precio debe ser un valor numérico válido",
  EMPTY_PRICE: "El precio es requerido",
  PRICE_POSITIVE: "El precio debe ser mayor a 0",
  INVALID_AVAILABILITY: "La disponibilidad debe ser un valor verdadero o falso",

  DB_URL_NOT_DEFINED: "DATABASE_URL no está definida en las variables de entorno",
  DB_CONNECTION: "Error al conectar la base de datos",

  EXTERNAL_API_ERROR: "Error al obtener datos de la API externa",

  RATE_LIMIT: "Demasiadas peticiones desde esta IP, por favor intente nuevamente en 15 minutos",
  REDIS_CONNECTION: "Error al conectar a Redis",

  ENV_VAR_NOT_DEFINED: "Variable de entorno no definida",
  SERVICE_UNAVAILABLE: "Servicio no disponible temporalmente",

  DELETE_ERROR: "Error al eliminar el producto",
  ACTIVATION_ERROR: "Error al activar el producto",
  DEACTIVATION_ERROR: "Error al desactivar el producto",

  INVALID_DATA: "Datos de producto inválidos",
  REDIS_CLIENT_ERROR: "Redis Client Error:",
};

export const SUCCESS_MESSAGES = {
    PRODUCT_CREATED: "Producto creado exitosamente",
    PRODUCT_UPDATED: "Producto actualizado exitosamente",
    PRODUCT_FETCHED: "Producto obtenido exitosamente",
    PRODUCTS_FETCHED: "Productos obtenidos exitosamente",
    PRODUCT_ACTIVATED: "Producto activado exitosamente",
    DB_CONNECTION: "Conexión exitosa a la base de datos",
    REDIS_CONNECTION: "Conexión exitosa a Redis",
    PRODUCT_DELETED: "Producto eliminado exitosamente",
    PRODUCT_DEACTIVATED: "Producto desactivado exitosamente",

};

export const CIRCUIT_BREAKER_MESSAGES = {
  OPEN: 'Circuito abierto',
  HALF_OPEN: 'Circuito medio abierto',
  CLOSED: 'Circuito cerrado'
};