import { Router } from 'express';
import * as locationController from '../controllers/locationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', locationController.getLocations);
router.get('/:id', locationController.getLocation);
router.get('/smart-search', authenticate, locationController.smartSearch);

export default router;

