import { Router, RequestHandler } from 'express';
import { param } from 'express-validator';
import { handleInputErrors } from './middleware/handleInputErrors';
import { ProductController } from './controllers/productController';
import { ERROR_MESSAGES } from './config/constants/messages';
import { withCircuitBreaker } from './middleware/circuitBreaker';

const router = Router();

// Obtener todos los productos
router.get('/', withCircuitBreaker('getAllProducts') as RequestHandler, 
  ProductController.getProducts as RequestHandler
);
// Obtener un producto por su ID
router.get('/:id',
  param('id').isInt().withMessage(ERROR_MESSAGES.INVALID_ID),
  handleInputErrors,
  withCircuitBreaker('getProductById') as RequestHandler,
  ProductController.getProductById as RequestHandler
);
// Crear un nuevo producto
router.post('/', 
  withCircuitBreaker('createProduct') as RequestHandler,
  ProductController.createProduct as RequestHandler
);
// Actualizar un producto existente
router.put('/:id',
  param('id').isInt().withMessage(ERROR_MESSAGES.INVALID_ID),
  handleInputErrors,
  withCircuitBreaker('updateProduct') as RequestHandler,
  ProductController.updateProduct as RequestHandler
);
// Activar o desactivar un producto
router.patch('/:id',
  param('id').isInt().withMessage(ERROR_MESSAGES.INVALID_ID),
  handleInputErrors,
  withCircuitBreaker('toggleActivate') as RequestHandler,
  ProductController.updateActivate as RequestHandler
);

export default router;