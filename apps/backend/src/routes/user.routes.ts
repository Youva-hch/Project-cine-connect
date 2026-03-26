import { Router, type IRouter } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router: IRouter = Router();

// GET /users - Récupère tous les utilisateurs
router.get('/', UserController.getAllUsers);

// PATCH /users/me - Met à jour le profil (authentification requise)
router.patch('/me', requireAuth, UserController.updateMe);

// PATCH /users/me/password - Changer son mot de passe
router.patch('/me/password', requireAuth, UserController.changeMyPassword);

// DELETE /users/me - Supprimer son compte
router.delete('/me', requireAuth, UserController.deleteMe);

// GET /users/me/reviews - Avis de l'utilisateur connecté (authentification requise)
router.get('/me/reviews', requireAuth, UserController.getMyReviews);

// GET /users/me/stats - Statistiques du profil (authentification requise)
router.get('/me/stats', requireAuth, UserController.getMyStats);

// GET /users/:id - Récupère un utilisateur par son ID
router.get('/:id', UserController.getUserById);

export { router as userRouter };

