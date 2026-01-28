import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /users - Récupère tous les utilisateurs
router.get('/', UserController.getAllUsers);

// PATCH /users/me - Met à jour le profil (authentification requise)
router.patch('/me', requireAuth, UserController.updateMe);

// GET /users/:id - Récupère un utilisateur par son ID
router.get('/:id', UserController.getUserById);

export { router as userRouter };

