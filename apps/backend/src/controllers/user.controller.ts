import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';

/**
 * Contrôleur pour gérer les routes des utilisateurs
 */
export class UserController {
  /**
   * GET /users - Récupère tous les utilisateurs
   */
  static async getAllUsers(_req: Request, res: Response) {
    try {
      const allUsers = await UserService.getAllUsers();
      res.json({
        success: true,
        data: allUsers,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
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
}

