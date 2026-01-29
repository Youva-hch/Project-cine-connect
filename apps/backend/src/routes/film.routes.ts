import { Router } from 'express';
import { FilmController } from '../controllers/film.controller.js';

const router = Router();

// GET /films - Récupère tous les films avec filtres optionnels
router.get('/', FilmController.getAllFilms);

// GET /films/category/:slug - Récupère les films d'une catégorie
router.get('/category/:slug', FilmController.getFilmsByCategory);

// GET /films/:id/reviews - Récupère les avis d'un film
router.get('/:id/reviews', FilmController.getFilmReviews);

// GET /films/:id - Récupère un film par son ID
router.get('/:id', FilmController.getFilmById);

export { router as filmRouter };



