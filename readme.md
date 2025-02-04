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

- **GET** `/api/products`
  - Obtiene todos los productos
  - Rate limit: 100 peticiones por IP cada 15 minutos

- **GET** `/api/products/:id`
  - Obtiene un producto específico
  - Parámetros: [id](http://_vscodecontentref_/2) (número entero)

- **POST** `/api/products`
  - Crea un nuevo producto
  - Body:
    ```json
    {
      "name": "string",
      "price": number,
      "activate": boolean
    }
    ```

- **PUT** `/api/products/:id`
  - Actualiza un producto existente
  - Parámetros: [id](http://_vscodecontentref_/3) (número entero)
  - Body: Similar al POST (campos opcionales)

- **PATCH** `/api/products/:id`
  - Activa/desactiva un producto
  - Parámetros: [id](http://_vscodecontentref_/4) (número entero)

## Características

- Circuit Breaker para manejo de fallos
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
