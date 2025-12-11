import { Router } from 'express';
import * as onboardingController from '../controllers/onboardingController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/preferences', optionalAuth, onboardingController.savePreferences);
router.post('/itineraries', onboardingController.getItineraries);
router.post('/reroll', onboardingController.rerollItineraries);
router.get('/weather', onboardingController.getWeather);

export default router;

