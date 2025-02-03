import { Router } from 'express';
import { param } from 'express-validator';
import { handleInputErrors } from './middleware/handleInputErrors';
import { ProductController } from './controllers/productController';
import { ERROR_MESSAGES } from './config/constants/messages';
import { withCircuitBreaker } from './middleware/circuitBreaker';

const router = Router();

// Add circuit breaker to routes
router.get('/', withCircuitBreaker('getAllProducts'), ProductController.getProducts);

router.get('/:id',
    param('id').isInt().withMessage(ERROR_MESSAGES.INVALID_ID),
    handleInputErrors,
    withCircuitBreaker('getProductById'),
    ProductController.getProductById
);

router.post('/', withCircuitBreaker('createProduct'), ProductController.createProduct);

router.put('/:id',
    param('id').isInt().withMessage(ERROR_MESSAGES.INVALID_ID),
    handleInputErrors,
    withCircuitBreaker('updateProduct'),
    ProductController.updateProduct
);

router.patch('/:id',
    param('id').isInt().withMessage(ERROR_MESSAGES.INVALID_ID),
    handleInputErrors,
    withCircuitBreaker('toggleActivate'),
    ProductController.updateActivate
);

export default router;