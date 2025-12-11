import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/oauth/google', authController.oauthGoogle);
router.post('/oauth/facebook', authController.oauthFacebook);

export default router;

