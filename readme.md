# ms-catalog

Microservicio de catálogo para gestionar los productos disponibles.

## Descripción

Este microservicio permite gestionar un catálogo de productos, incluyendo la obtención, adición y modificación de ellos.

## Instalación

1. Clona el repositorio:
    ```sh
    git clone https://github.com/Kobyuu/ms-catalog.git
    ```
2. Navega al directorio del proyecto:
    ```sh
    cd ms-catalog
    ```

## Configuración

1. Crea un archivo [.env](http://_vscodecontentref_/1) en la raíz del proyecto:
    ```env
    DATABASE_URL=postgres://usuario:contraseña@localhost:5432/ms-catalog
    PORT=4001
    REDIS_URL=redis://redis:6379
    REDIS_HOST=redis
    REDIS_PORT=6379
    CACHE_EXPIRY=3600
    RETRY_ATTEMPTS=3
    RETRY_DELAY=1000
    ```

## Ejecución con Docker (Recomendado)

1. Construye y levanta los contenedores:
    ```sh
    docker-compose up --build
    ```

2. La aplicación estará disponible en:
    - API: http://localhost:5001
    - PostgreSQL: localhost:6432
    - Redis: localhost:7379

3. Para detener los contenedores:
    ```sh
    docker-compose down
    ```

## Desarrollo Local

1. Instala las dependencias:
    ```sh
    npm install
    ```

2. Inicia el servidor de desarrollo:
    ```sh
    npm run dev
    ```

## Scripts Administrativos

- Sembrar la base de datos:
    ```sh
    npm run db:seed
    ```

- Limpiar productos inactivos:
    ```sh
    npm run admin:cleanup
    ```

- Generar reporte de inventario:
    ```sh
    npm run admin:report
    ```

## API Endpoints

### Productos

- **GET** `/api/product`
  - Obtiene todos los productos
  - Rate limit: 100,000 peticiones por IP cada 15 minutos

- **GET** `/api/product/:id`
  - Obtiene un producto específico
  - Parámetros: id (número entero)

- **POST** `/api/product`
  - Crea un nuevo producto
  - Body:
    ```json
    {
      "name": "string", 
      "price": number,
      "activate": boolean
    }
    ```

- **PUT** `/api/product/:id`
  - Actualiza un producto existente
  - Parámetros: id (número entero)
  - Body: Similar al POST (campos opcionales)

- **PATCH** `/api/product/:id`
  - Activa/desactiva un producto
  - Parámetros: id (número entero)

## Características

- Rate Limiting por IP
- Caché con Redis
- Logs estructurados con Winston
- Tests con Jest
- TypeScript
- Docker Compose para desarrollo y producción

## Tests

Ejecutar los tests:
```sh
npm test
```

### Configuración de Jest

El proyecto está configurado para usar Jest con TypeScript. La configuración de Jest se encuentra en el archivo [jest.config.js](jest.config.js):

```javascript
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { isolatedModules: true }],
  },
  setupFilesAfterEnv: ["./jest.setup.js"],
  testTimeout: 30000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  detectOpenHandles: true,
  forceExit: true,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  }
};
```

### Setup de Jest

El archivo de setup de Jest [jest.setup.js](jest.setup.js) configura el entorno de pruebas, incluyendo el mock de Redis y la configuración de variables de entorno:

```javascript
const Redis = require('ioredis-mock');

// Mock Redis globalmente
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return new Redis();
  });
});

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';


// Silenciar logs en las pruebas
global.console = {
  ...console,
  log: jest.fn(), // Desactiva console.log
  warn: jest.fn(),
  error: console.error, // Mantén los errores visibles
};

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  // Cierra la conexión de Redis correctamente
  const { redis } = require('./src/config/redisClient');
  await redis.quit();
});
```