import { Router } from 'express';
import * as itineraryController from '../controllers/itineraryController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, itineraryController.getItineraries);
router.get('/:id', authenticate, itineraryController.getItinerary);
router.post('/', authenticate, itineraryController.createItinerary);
router.put('/:id', authenticate, itineraryController.updateItinerary);
router.delete('/:id', authenticate, itineraryController.deleteItinerary);
router.put('/:id/items/reorder', authenticate, itineraryController.reorderItems);
router.post('/:id/items', authenticate, itineraryController.addItem);
router.delete('/:id/items/:itemId', authenticate, itineraryController.deleteItem);
router.post('/:id/optimize', authenticate, itineraryController.optimizeItinerary);
router.post('/:id/localize', authenticate, itineraryController.localizeItinerary);
router.post('/:id/schedule', authenticate, itineraryController.scheduleItinerary);

export default router;

