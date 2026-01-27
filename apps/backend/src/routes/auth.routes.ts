import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';

const router = Router();

// GET /auth/google - Initie l'authentification Google
router.get('/google', AuthController.googleAuth);

// GET /auth/google/callback - Callback après authentification Google
router.get('/google/callback', AuthController.googleCallback);

// GET /auth/me - Vérifie le token JWT et retourne l'utilisateur
router.get('/me', AuthController.verifyToken);

export { router as authRouter };

