import { Router, type IRouter } from 'express';
import { OMDbController } from '../controllers/omdb.controller.js';

const router: IRouter = Router();

// GET /omdb/cache - Etat du cache en memoire
router.get('/cache', OMDbController.getCache);

// GET /omdb/search - Recherche de films
router.get('/search', OMDbController.search);

// GET /omdb/movie/title/:title - Récupère un film par titre
router.get('/movie/title/:title', OMDbController.getByTitle);

// GET /omdb/movie/:imdbId - Récupère un film par ID IMDb
router.get('/movie/:imdbId', OMDbController.getByImdbId);

// POST /omdb/sync - Synchronise les films depuis OMDb vers la base de données
router.post('/sync', OMDbController.syncFilms);

export { router as omdbRouter };





