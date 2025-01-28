# ms-catalog

Microservicio de catálogo para gestionar los productos disponibles.

## Descripción

Este microservicio permite gestionar un catálogo de productos, incluyendo la obtención, adición y modificación de productos.

## Instalación

1. Clona el repositorio:
    ```sh
    git clone https://github.com/TuUsuario/ms-catalog.git
    ```
2. Navega al directorio del proyecto:
    ```sh
    cd ms-catalog
    ```
3. Instala las dependencias:
    ```sh
    npm install
    ```

## Configuración

1. Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
    ```env
    # Configuración de la base de datos
    DATABASE_URL=postgres://usuario:contraseña@localhost:5432/ms-catalog
    ```

## Uso sin docker

1. Inicia el servidor:
    ```sh
    npm run dev
    ```
2. El servidor estará disponible en `http://localhost:4001`.

### Uso con Docker

1. Tener Docker Desktop instalado.
2. Construye las imágenes de Docker y levanta los contenedores con:
    ```sh
    docker-compose up --build
    ```
3. El servidor estará disponible en `http://localhost:4001` (como en el uso sin Docker).
4. Para detener los contenedores: 
    ```sh
    docker-compose down
    ```

## Rutas de la API

- **GET** `/api/products/`: Obtener todos los productos disponibles en el catálogo.
- **POST** `/api/products/`: Agregar un nuevo producto al catálogo.
- **PUT** `/api/products/:id`: Editar las características de un producto en el catálogo.

## Mensajes de error

Los mensajes de error personalizados se encuentran en la carpeta `config/constants`

