import { Router } from 'express';
import { param } from 'express-validator';
import { handleInputErrors } from './middleware/handleInputErrors';
import { ProductController } from './controllers/productController';
import { ERROR_MESSAGES } from './config/constants/messages';

const router = Router();

// Ruta para obtener todos los productos
router.get('/', ProductController.getProducts);

// Ruta para obtener un producto por ID con validación
router.get('/:id',
    param('id').isInt().withMessage(ERROR_MESSAGES.INVALID_ID),
    handleInputErrors,
    ProductController.getProductById
);

// Ruta para crear un producto
router.post('/', ProductController.createProduct);

// Ruta para actualizar un producto por ID
router.put('/:id',
    param('id').isInt().withMessage(ERROR_MESSAGES.INVALID_ID),
    handleInputErrors,
    ProductController.updateProduct
);

// Ruta para alternar el estado de activación de un producto
router.patch('/:id',
    param('id').isInt().withMessage(ERROR_MESSAGES.INVALID_ID),
    handleInputErrors,
    ProductController.updateActivate
);

export default router;