import { Request, Response } from 'express';
import { OMDbService } from '../services/omdb.service.js';

/**
 * Contrôleur pour gérer les routes de l'API OMDb
 */
export class OMDbController {
  /**
   * GET /omdb/search - Recherche de films via OMDb
   */
  static async search(req: Request, res: Response) {
    try {
      const { s: searchTerm, page, type, year } = req.query;

      if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre "s" (searchTerm) est requis',
        });
      }

      const result = await OMDbService.search(searchTerm, {
        page: page ? parseInt(page as string, 10) : undefined,
        type: type as 'movie' | 'series' | 'episode' | undefined,
        year: year ? parseInt(year as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error searching OMDb:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la recherche OMDb',
      });
    }
  }

  /**
   * GET /omdb/movie/:imdbId - Récupère les détails d'un film par ID IMDb
   */
  static async getByImdbId(req: Request, res: Response) {
    try {
      const { imdbId } = req.params;

      if (!imdbId) {
        return res.status(400).json({
          success: false,
          message: 'ID IMDb requis',
        });
      }

      const movie = await OMDbService.getByImdbId(imdbId);

      res.json({
        success: true,
        data: movie,
      });
    } catch (error) {
      console.error('Error fetching movie from OMDb:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la récupération du film',
      });
    }
  }

  /**
   * GET /omdb/movie/title/:title - Récupère les détails d'un film par titre
   */
  static async getByTitle(req: Request, res: Response) {
    try {
      const { title } = req.params;
      const { year } = req.query;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Titre requis',
        });
      }

      const movie = await OMDbService.getByTitle(
        title,
        year ? parseInt(year as string, 10) : undefined
      );

      res.json({
        success: true,
        data: movie,
      });
    } catch (error) {
      console.error('Error fetching movie from OMDb:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la récupération du film',
      });
    }
  }
}


