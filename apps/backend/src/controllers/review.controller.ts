import { Response } from 'express';
import { FilmService } from '../services/film.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

export class ReviewController {
  /**
   * PATCH /api/reviews/:id - Modifier un avis (auteur uniquement)
   */
  static async updateReview(req: AuthRequest, res: Response) {
    try {
      const reviewId = req.params.id as unknown as number;
      const { rating, comment } = req.body;

      const data: { rating?: number; comment?: string } = {};
      if (rating !== undefined) data.rating = rating;
      if (comment !== undefined) data.comment = comment;

      const result = await FilmService.updateReview(reviewId, req.userId!, data);

      if (result === null) {
        return res.status(404).json({ success: false, message: 'Avis introuvable' });
      }
      if (result === 'forbidden') {
        return res.status(403).json({ success: false, message: 'Vous ne pouvez pas modifier cet avis' });
      }

      return res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error updating review:', error);
      return res.status(500).json({ success: false, message: "Erreur lors de la modification de l'avis" });
    }
  }

  /**
   * DELETE /api/reviews/:id - Supprimer un avis (auteur uniquement)
   */
  static async deleteReview(req: AuthRequest, res: Response) {
    try {
      const reviewId = req.params.id as unknown as number;

      const result = await FilmService.deleteReview(reviewId, req.userId!);

      if (result === null) {
        return res.status(404).json({ success: false, message: 'Avis introuvable' });
      }
      if (result === 'forbidden') {
        return res.status(403).json({ success: false, message: 'Vous ne pouvez pas supprimer cet avis' });
      }

      return res.json({ success: true, message: 'Avis supprimé' });
    } catch (error) {
      console.error('Error deleting review:', error);
      return res.status(500).json({ success: false, message: "Erreur lors de la suppression de l'avis" });
    }
  }
}
