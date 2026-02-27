import { Router, type IRouter } from 'express';
import { FilmController } from '../controllers/film.controller.js';

const router: IRouter = Router();

// GET /categories - Récupère toutes les catégories
router.get('/', FilmController.getAllCategories);

export { router as categoryRouter };





