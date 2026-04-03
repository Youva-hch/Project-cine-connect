import { Router, type IRouter } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/schemas.js';

const router: IRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentification des utilisateurs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Créer un compte
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Houche Youva
 *               email:
 *                 type: string
 *                 example: houche@email.com
 *               password:
 *                 type: string
 *                 example: motdepasse123
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *       400:
 *         description: Email déjà utilisé ou données invalides
 */
router.post('/register', validate(registerSchema), AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Se connecter
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: houche@email.com
 *               password:
 *                 type: string
 *                 example: motdepasse123
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne un token JWT
 *       401:
 *         description: Email ou mot de passe incorrect
 */
router.post('/login', validate(loginSchema), AuthController.login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Envoyer un email de réinitialisation de mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: houche@email.com
 *     responses:
 *       200:
 *         description: Email envoyé (ou réponse neutre si compte introuvable)
 */
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe via token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, token, password]
 *             properties:
 *               email:
 *                 type: string
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé
 *       400:
 *         description: Token invalide ou expiré
 */
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renouveler la session via refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Nouveau access token (refresh token rotaté en cookie HttpOnly)
 *       401:
 *         description: Refresh token invalide
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnecter l'utilisateur
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Cookie refresh token supprimé
 */
router.post('/logout', AuthController.logout);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Connexion via Google OAuth
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirige vers Google pour l'authentification
 */
router.get('/google', AuthController.googleAuth);

// GET /auth/google/callback - Callback après authentification Google
router.get('/google/callback', AuthController.googleCallback);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer son profil
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur connecté
 *       401:
 *         description: Token manquant ou invalide
 */
router.get('/me', AuthController.verifyToken);

export { router as authRouter };
