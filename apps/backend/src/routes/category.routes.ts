import { Router } from 'express';
import { FilmController } from '../controllers/film.controller.js';

const router = Router();

// GET /categories - Récupère toutes les catégories
router.get('/', FilmController.getAllCategories);

export { router as categoryRouter };


