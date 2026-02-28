import { Router, type IRouter } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router: IRouter = Router();

// PATCH /api/reviews/:id - Modifier un avis (auteur uniquement)
router.patch('/:id', requireAuth, ReviewController.updateReview as any);

// DELETE /api/reviews/:id - Supprimer un avis (auteur uniquement)
router.delete('/:id', requireAuth, ReviewController.deleteReview as any);

export { router as reviewRouter };
