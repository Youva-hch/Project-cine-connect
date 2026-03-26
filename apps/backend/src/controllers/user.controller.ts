import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

/**
 * Contrôleur pour gérer les routes des utilisateurs
 */
export class UserController {
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
      return res.json({
        success: true,
        data: allUsers,
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
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID invalide',
        });
      }

      const user = await UserService.getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      return res.json({
        success: true,
        data: user,
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

      const { name, bio, avatarUrl } = req.body as {
        name?: string;
        bio?: string | null;
        avatarUrl?: string | null;
      };

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

