import { Router, type IRouter } from 'express';
import { FilmController } from '../controllers/film.controller.js';
import { requireAdmin, requireAuth } from '../middlewares/auth.middleware.js';

const router: IRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Films
 *   description: Gestion des films
 */

/**
 * @swagger
 * /api/films:
 *   get:
 *     summary: Liste tous les films
 *     tags: [Films]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrer par catégorie
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: Filtrer par année
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *     responses:
 *       200:
 *         description: Liste des films
 */
router.get('/', FilmController.getAllFilms);

/**
 * @swagger
 * /api/films/omdb-sync:
 *   post:
 *     summary: Synchroniser un film depuis OMDB
 *     tags: [Films]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [imdbID]
 *             properties:
 *               imdbID:
 *                 type: string
 *                 example: tt1375666
 *     responses:
 *       200:
 *         description: Film synchronisé
 *       400:
 *         description: Données invalides
 */
router.post('/omdb-sync', FilmController.omdbSync);

/**
 * @swagger
 * /api/films/category/{slug}:
 *   get:
 *     summary: Films d'une catégorie
 *     tags: [Films]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug de la catégorie (ex. action)
 *     responses:
 *       200:
 *         description: Films de la catégorie
 *       404:
 *         description: Catégorie introuvable
 */
router.get('/category/:slug', FilmController.getFilmsByCategory);

// GET /api/films/by-imdb/:imdbId/reviews - Reviews par imdbId
router.get('/by-imdb/:imdbId/reviews', FilmController.getReviewsByImdbId);

/**
 * @swagger
 * /api/films/{id}/reviews:
 *   get:
 *     summary: Avis d'un film
 *     tags: [Films]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des avis
 *   post:
 *     summary: Ajouter un avis sur un film
 *     tags: [Films]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Très bon film !
 *     responses:
 *       201:
 *         description: Avis ajouté
 *       401:
 *         description: Token manquant ou invalide
 */
router.get('/:id/reviews', FilmController.getFilmReviews);
router.post('/:id/reviews', requireAuth, FilmController.createReview as any);

/**
 * @swagger
 * /api/films/{id}:
 *   get:
 *     summary: Détail d'un film
 *     tags: [Films]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Informations du film
 *       404:
 *         description: Film introuvable
 *   patch:
 *     summary: Modifier un film (admin)
 *     tags: [Films]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Film modifié
 *       403:
 *         description: Accès refusé
 *   delete:
 *     summary: Supprimer un film (admin)
 *     tags: [Films]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Film supprimé
 *       403:
 *         description: Accès refusé
 */
router.get('/:id', FilmController.getFilmById);
router.patch('/:id', requireAdmin, FilmController.updateFilm);
router.delete('/:id', requireAdmin, FilmController.deleteFilm);

/**
 * @swagger
 * /api/films:
 *   post:
 *     summary: Créer un film (admin)
 *     tags: [Films]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Inception
 *     responses:
 *       201:
 *         description: Film créé
 *       403:
 *         description: Accès refusé
 */
router.post('/', requireAdmin, FilmController.createFilm);

export { router as filmRouter };
