import { Request, Response } from 'express';
import { FilmService } from '../services/film.service.js';

/**
 * Contrôleur pour gérer les routes des films
 */
export class FilmController {
  /**
   * GET /films - Récupère tous les films avec filtres optionnels
   */
  static async getAllFilms(req: Request, res: Response) {
    try {
      const { search, category, page, limit } = req.query;

      const films = await FilmService.getAllFilms({
        search: search as string | undefined,
        category: category as string | undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: films,
      });
    } catch (error) {
      console.error('Error fetching films:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des films',
      });
    }
  }

  /**
   * GET /films/:id - Récupère un film par son ID
   */
  static async getFilmById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID invalide',
        });
      }

      const film = await FilmService.getFilmById(id);
      if (!film) {
        return res.status(404).json({
          success: false,
          message: 'Film non trouvé',
        });
      }

      return res.json({
        success: true,
        data: film,
      });
    } catch (error) {
      console.error('Error fetching film:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du film',
      });
    }
  }

  /**
   * GET /films/category/:slug - Récupère les films d'une catégorie
   */
  static async getFilmsByCategory(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const films = await FilmService.getFilmsByCategory(slug);

      res.json({
        success: true,
        data: films,
      });
    } catch (error) {
      console.error('Error fetching films by category:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des films',
      });
    }
  }

  /**
   * GET /categories - Récupère toutes les catégories
   */
  static async getAllCategories(_req: Request, res: Response) {
    try {
      const categories = await FilmService.getAllCategories();
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des catégories',
      });
    }
  }

  /**
   * GET /films/:id/reviews - Récupère les avis d'un film
   */
  static async getFilmReviews(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID invalide',
        });
      }

      const reviews = await FilmService.getFilmReviews(id);
      return res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      console.error('Error fetching film reviews:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des avis',
      });
    }
  }
}





