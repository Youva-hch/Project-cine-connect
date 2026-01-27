import { Router } from 'express';
import { OMDbController } from '../controllers/omdb.controller.js';

const router = Router();

// GET /omdb/search - Recherche de films
router.get('/search', OMDbController.search);

// GET /omdb/movie/title/:title - Récupère un film par titre
router.get('/movie/title/:title', OMDbController.getByTitle);

// GET /omdb/movie/:imdbId - Récupère un film par ID IMDb
router.get('/movie/:imdbId', OMDbController.getByImdbId);

export { router as omdbRouter };

