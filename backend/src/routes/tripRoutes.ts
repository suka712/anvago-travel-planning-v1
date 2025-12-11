import { Router } from 'express';
import * as tripController from '../controllers/tripController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/:itineraryId/start', authenticate, tripController.startTrip);
router.post('/:itineraryId/tracking', authenticate, tripController.updateTracking);
router.get('/:itineraryId/status', authenticate, tripController.getTripStatus);
router.post('/:itineraryId/complete-item', authenticate, tripController.completeItem);
router.post('/:itineraryId/smart-routing', authenticate, tripController.getSmartRouting);

export default router;

