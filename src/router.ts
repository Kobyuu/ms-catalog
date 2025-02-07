import { Router, RequestHandler } from 'express';
import { param } from 'express-validator';
import { handleInputErrors } from './middleware/handleInputErrors';
import { ProductController } from './controllers/productController';
import { ERROR_MESSAGES } from './config/constants/messages';

const router = Router();

// Validación de ID
const validateId = param('id').isInt().withMessage(ERROR_MESSAGES.INVALID_ID);

// Obtener todos los productos
router.get('/', ProductController.getProducts as RequestHandler);

// Obtener un producto por su ID
router.get('/:id', validateId, handleInputErrors, ProductController.getProductById as RequestHandler);

// Crear un nuevo producto
router.post('/', ProductController.createProduct as RequestHandler);

// Actualizar un producto existente
router.put('/:id', validateId, handleInputErrors, ProductController.updateProduct as RequestHandler);

// Activar o desactivar un producto
router.patch('/:id', validateId, handleInputErrors, ProductController.updateActivate as RequestHandler);

export default router;