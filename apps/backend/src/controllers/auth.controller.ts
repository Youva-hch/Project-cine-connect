import { Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

/**
 * Contrôleur pour gérer l'authentification
 */
export class AuthController {
  /**
   * Initie l'authentification Google
   */
  static googleAuth(req: Request, res: Response) {
    passport.authenticate('google', {
      scope: ['profile', 'email'],
    })(req, res);
  }

  /**
   * Callback après authentification Google
   */
  static googleCallback(req: Request, res: Response) {
    passport.authenticate('google', { session: false }, (err: any, user: any) => {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
      }

      // Générer un token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Rediriger vers le frontend avec le token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      }))}`);
    })(req, res);
  }

  /**
   * Vérifie le token et retourne l'utilisateur
   */
  static async verifyToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token manquant',
        });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as { userId: number; email: string };

      // Récupérer l'utilisateur
      const { UserService } = await import('../services/user.service.js');
      const user = await UserService.getUserById(decoded.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      // Ne pas retourner le mot de passe
      const { passwordHash, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token invalide',
      });
    }
  }
}

