import { Router, type IRouter } from 'express';
import { FilmController } from '../controllers/film.controller.js';
import { requireAdmin, requireAuth } from '../middlewares/auth.middleware.js';

const router: IRouter = Router();

// GET /api/films - Liste avec filtres (catégorie, année, note) et pagination
router.get('/', FilmController.getAllFilms);

// POST /api/films/omdb-sync - Upsert un film OMDB (doit être avant /:id)
router.post('/omdb-sync', FilmController.omdbSync);

// GET /api/films/category/:slug - Films d'une catégorie
router.get('/category/:slug', FilmController.getFilmsByCategory);

// GET /api/films/by-imdb/:imdbId/reviews - Reviews par imdbId
router.get('/by-imdb/:imdbId/reviews', FilmController.getReviewsByImdbId);

// GET /api/films/:id/reviews - Avis d'un film
router.get('/:id/reviews', FilmController.getFilmReviews);

// POST /api/films/:id/reviews - Ajouter un avis (auth requis)
router.post('/:id/reviews', requireAuth, FilmController.createReview as any);

// GET /api/films/:id - Détail d'un film
router.get('/:id', FilmController.getFilmById);

// POST /api/films - Créer un film (admin uniquement)
router.post('/', requireAdmin, FilmController.createFilm);

// PATCH /api/films/:id - Modifier un film (admin uniquement)
router.patch('/:id', requireAdmin, FilmController.updateFilm);

// DELETE /api/films/:id - Supprimer un film (admin uniquement)
router.delete('/:id', requireAdmin, FilmController.deleteFilm);

export { router as filmRouter };





