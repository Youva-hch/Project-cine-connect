import { Request, Response } from 'express';
import { FilmService } from '../services/film.service.js';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  const err = error as { message?: string; cause?: unknown };
  if (err.message) return String(err.message);
  if (err.cause instanceof Error) return err.cause.message;
  return String(error);
}

/**
 * Contrôleur pour gérer les routes des films
 */
export class FilmController {
  /**
   * GET /api/films - Récupère tous les films avec filtres et pagination
   */
  static async getAllFilms(req: Request, res: Response) {
    try {
      const { search, category, year, yearMin, yearMax, ratingMin, ratingMax, page, limit } =
        req.query;

      const result = await FilmService.getAllFilms({
        search: search as string | undefined,
        category: category as string | undefined,
        year: year ? parseInt(year as string, 10) : undefined,
        yearMin: yearMin ? parseInt(yearMin as string, 10) : undefined,
        yearMax: yearMax ? parseInt(yearMax as string, 10) : undefined,
        ratingMin: ratingMin != null ? parseFloat(ratingMin as string) : undefined,
        ratingMax: ratingMax != null ? parseFloat(ratingMax as string) : undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      const msg = getErrorMessage(error);
      console.error('Error fetching films:', msg, error);
      const isDbError =
        msg.includes('relation') ||
        msg.includes('does not exist') ||
        msg.includes('Failed query');
      res.status(500).json({
        success: false,
        message: isDbError
          ? `${msg} — Exécutez les migrations sur la même base que le backend : pnpm db:migrate`
          : msg,
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
   * POST /api/films - Crée un film (admin uniquement)
   */
  static async createFilm(req: Request, res: Response) {
    try {
      const { title, description, director, releaseYear, durationMinutes, posterUrl, categoryIds } =
        req.body;

      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Le titre est requis',
        });
      }

      const film = await FilmService.createFilm({
        title: title.trim(),
        description: description ?? null,
        director: director ?? null,
        releaseYear: releaseYear != null ? parseInt(String(releaseYear), 10) : null,
        durationMinutes: durationMinutes != null ? parseInt(String(durationMinutes), 10) : null,
        posterUrl: posterUrl ?? null,
        categoryIds: Array.isArray(categoryIds) ? categoryIds.map(Number).filter(Boolean) : undefined,
      });

      if (!film) {
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la création du film',
        });
      }

      return res.status(201).json({
        success: true,
        data: film,
      });
    } catch (error) {
      console.error('Error creating film:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du film',
      });
    }
  }

  /**
   * PATCH /api/films/:id - Met à jour un film (admin uniquement)
   */
  static async updateFilm(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID invalide',
        });
      }

      const { title, description, director, releaseYear, durationMinutes, posterUrl, categoryIds } =
        req.body;

      const film = await FilmService.updateFilm(id, {
        ...(title !== undefined && { title: typeof title === 'string' ? title.trim() : title }),
        ...(description !== undefined && { description }),
        ...(director !== undefined && { director }),
        ...(releaseYear !== undefined && {
          releaseYear: releaseYear == null ? null : parseInt(String(releaseYear), 10),
        }),
        ...(durationMinutes !== undefined && {
          durationMinutes:
            durationMinutes == null ? null : parseInt(String(durationMinutes), 10),
        }),
        ...(posterUrl !== undefined && { posterUrl }),
        ...(categoryIds !== undefined && {
          categoryIds: Array.isArray(categoryIds) ? categoryIds.map(Number).filter(Boolean) : [],
        }),
      });

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
      console.error('Error updating film:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du film',
      });
    }
  }

  /**
   * DELETE /api/films/:id - Supprime un film (admin uniquement)
   */
  static async deleteFilm(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID invalide',
        });
      }

      const deleted = await FilmService.deleteFilm(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Film non trouvé',
        });
      }

      return res.json({
        success: true,
        message: 'Film supprimé',
      });
    } catch (error) {
      console.error('Error deleting film:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du film',
      });
    }
  }

  /**
   * GET /api/films/:id/reviews - Récupère les avis d'un film
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





