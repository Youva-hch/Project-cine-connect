import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';

const router = Router();

// GET /users - Récupère tous les utilisateurs
router.get('/', UserController.getAllUsers);

// GET /users/:id - Récupère un utilisateur par son ID
router.get('/:id', UserController.getUserById);

export { router as userRouter };

