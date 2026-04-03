import { Request, Response } from 'express';
import { FilmService } from '../services/film.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Une erreur est survenue";
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
        req.query as any;

      const result = await FilmService.getAllFilms({
        search,
        category,
        year,
        yearMin,
        yearMax,
        ratingMin,
        ratingMax,
        page,
        limit,
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
      const id = req.params.id as unknown as number;

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

      const film = await FilmService.createFilm({
        title,
        description: description ?? null,
        director: director ?? null,
        releaseYear: releaseYear ?? null,
        durationMinutes: durationMinutes ?? null,
        posterUrl: posterUrl ?? null,
        categoryIds: Array.isArray(categoryIds) ? categoryIds : undefined,
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
      const id = req.params.id as unknown as number;

      const { title, description, director, releaseYear, durationMinutes, posterUrl, categoryIds } =
        req.body;

      const film = await FilmService.updateFilm(id, {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(director !== undefined && { director }),
        ...(releaseYear !== undefined && { releaseYear }),
        ...(durationMinutes !== undefined && { durationMinutes }),
        ...(posterUrl !== undefined && { posterUrl }),
        ...(categoryIds !== undefined && {
          categoryIds: Array.isArray(categoryIds) ? categoryIds : [],
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
      const id = req.params.id as unknown as number;

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
      const id = req.params.id as unknown as number;

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

  /**
   * POST /api/films/:id/reviews - Ajouter un avis (auth requis)
   */
  static async createReview(req: AuthRequest, res: Response) {
    try {
      const filmId = req.params.id as unknown as number;
      const { rating, comment } = req.body;

      const review = await FilmService.createReview({
        userId: req.userId!,
        filmId,
        rating,
        comment: typeof comment === 'string' ? comment : undefined,
      });

      return res.status(201).json({ success: true, data: review });
    } catch (error: unknown) {
      const pgError = error as { code?: string };
      if (pgError?.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Vous avez déjà noté ce film',
        });
      }
      console.error('Error creating review:', error);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la création de l'avis",
      });
    }
  }

  /**
   * POST /api/films/omdb-sync - Upsert un film OMDB dans la BDD, retourne l'id interne
   */
  static async omdbSync(req: Request, res: Response) {
    try {
      const { imdbId, title, posterUrl, director, releaseYear, description } = req.body;

      if (!imdbId || !title) {
        return res.status(400).json({ success: false, message: 'imdbId et title sont requis' });
      }

      const film = await FilmService.upsertByImdbId({
        imdbId,
        title,
        posterUrl,
        director,
        releaseYear: releaseYear ?? undefined,
        description,
      });

      return res.json({ success: true, data: film });
    } catch (error) {
      console.error('Error syncing OMDB film:', error);
      return res.status(500).json({ success: false, message: 'Erreur lors de la synchronisation du film' });
    }
  }

  /**
   * GET /api/films/by-imdb/:imdbId/reviews - Reviews d'un film via imdbId
   */
  static async getReviewsByImdbId(req: Request, res: Response) {
    try {
      const { imdbId } = req.params;
      const reviews = await FilmService.getReviewsByImdbId(imdbId);
      return res.json({ success: true, data: reviews });
    } catch (error) {
      console.error('Error fetching reviews by imdbId:', error);
      return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des avis' });
    }
  }
}





