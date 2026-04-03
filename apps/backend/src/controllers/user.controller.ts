import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

/**
 * Contrôleur pour gérer les routes des utilisateurs
 */
export class UserController {
  /**
   * GET /users/:id/stats - Statistiques publiques d'un utilisateur
   */
  static async getUserStatsById(req: Request, res: Response) {
    try {
      const id = req.params.id as unknown as number;

      const user = await UserService.getUserById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      const stats = await UserService.getPublicUserStats(id);
      return res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching public user stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
      });
    }
  }

  /**
   * GET /users/:id/reviews - Avis publics d'un utilisateur
   */
  static async getUserReviewsById(req: Request, res: Response) {
    try {
      const id = req.params.id as unknown as number;

      const user = await UserService.getUserById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      const reviews = await UserService.getUserReviews(id);
      return res.json({ success: true, data: reviews });
    } catch (error) {
      console.error('Error fetching user reviews by id:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des avis',
      });
    }
  }

  /**
   * PATCH /users/me/password - Change le mot de passe de l'utilisateur connecté
   */
  static async changeMyPassword(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }

      const { currentPassword, newPassword } = req.body;

      const result = await UserService.changePassword(userId, currentPassword, newPassword);
      if (!result.ok) {
        if (result.reason === 'not_found') {
          return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        if (result.reason === 'invalid_current_password') {
          return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect' });
        }
      }

      return res.json({ success: true, message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du changement de mot de passe',
      });
    }
  }

  /**
   * DELETE /users/me - Supprime le compte de l'utilisateur connecté
   */
  static async deleteMe(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }

      const deleted = await UserService.deleteUserAccount(userId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      return res.json({ success: true, message: 'Compte supprimé' });
    } catch (error) {
      console.error('Error deleting account:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du compte',
      });
    }
  }

  /**
   * GET /users/me/reviews - Récupère les avis de l'utilisateur connecté
   */
  static async getMyReviews(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
      }

      const reviews = await UserService.getUserReviews(userId);
      return res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      console.error('Error fetching my reviews:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des avis',
      });
    }
  }

  /**
   * GET /users/me/stats - Récupère les statistiques du profil utilisateur connecté
   */
  static async getMyStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
      }

      const stats = await UserService.getUserStats(userId);
      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
      });
    }
  }

  /**
   * GET /users - Récupère tous les utilisateurs
   */
  static async getAllUsers(_req: Request, res: Response) {
    try {
      const allUsers = await UserService.getAllUsers();
      const sanitizedUsers = allUsers.map(({ passwordHash: _passwordHash, ...rest }) => rest);
      return res.json({
        success: true,
        data: sanitizedUsers,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des utilisateurs',
      });
    }
  }

  /**
   * GET /users/:id - Récupère un utilisateur par son ID
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const id = req.params.id as unknown as number;

      const user = await UserService.getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      const { passwordHash: _passwordHash, ...userWithoutPassword } = user;

      return res.json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'utilisateur',
      });
    }
  }

  /**
   * PATCH /users/me - Met à jour le profil de l'utilisateur connecté
   */
  static async updateMe(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
      }

      const { name, bio, avatarUrl } = req.body;

      const updated = await UserService.updateUser(userId, {
        name,
        bio,
        avatarUrl,
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      const { passwordHash: _passwordHash, ...userWithoutPassword } = updated;
      return res.json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du profil',
      });
    }
  }
}

