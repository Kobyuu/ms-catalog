import { Router, RequestHandler } from 'express';
import { param } from 'express-validator';
import { handleInputErrors } from './middleware/handleInputErrors';
import { ProductController } from './controllers/productController';
import { ERROR_MESSAGES } from './config/constants/messages';
import { withCircuitBreaker } from './middleware/circuitBreaker';

const router = Router();

router.get('/', withCircuitBreaker('getAllProducts') as RequestHandler, ProductController.getProducts as RequestHandler);

router.get('/:id',
  param('id').isInt().withMessage(ERROR_MESSAGES.INVALID_ID),
  handleInputErrors,
  withCircuitBreaker('getProductById') as RequestHandler,
  ProductController.getProductById as RequestHandler
);

router.post('/', 
  withCircuitBreaker('createProduct') as RequestHandler,
  ProductController.createProduct as RequestHandler
);

router.put('/:id',
  param('id').isInt().withMessage(ERROR_MESSAGES.INVALID_ID),
  handleInputErrors,
  withCircuitBreaker('updateProduct') as RequestHandler,
  ProductController.updateProduct as RequestHandler
);

router.patch('/:id',
  param('id').isInt().withMessage(ERROR_MESSAGES.INVALID_ID),
  handleInputErrors,
  withCircuitBreaker('toggleActivate') as RequestHandler,
  ProductController.updateActivate as RequestHandler
);

export default router;