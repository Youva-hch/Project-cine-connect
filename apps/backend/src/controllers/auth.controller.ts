import { Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserService } from '../services/user.service.js';

function signToken(user: { id: number; email: string }) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

function toUserResponse(user: { id: number; email: string; name: string; avatarUrl: string | null; bio?: string | null }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio ?? null,
  };
}

/**
 * Contrôleur pour gérer l'authentification
 */
export class AuthController {
  /**
   * POST /auth/register - Inscription email / mot de passe
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, name, password } = req.body as { email?: string; name?: string; password?: string };
      if (!email?.trim() || !name?.trim() || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email, nom et mot de passe requis',
        });
      }
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 6 caractères',
        });
      }
      const existing = await UserService.getUserByEmail(email.trim());
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Un compte existe déjà avec cet email',
        });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await UserService.createUser({
        email: email.trim(),
        name: name.trim(),
        passwordHash,
      });
      if (!user) {
        return res.status(500).json({ success: false, message: 'Erreur lors de la création du compte' });
      }
      const token = signToken(user);
      const { passwordHash: _, ...rest } = user;
      res.status(201).json({
        success: true,
        data: { token, user: toUserResponse(rest as { id: number; email: string; name: string; avatarUrl: string | null; bio?: string | null }) },
      });
    } catch (error: unknown) {
      console.error('Auth register error:', error);
      const isDev = process.env.NODE_ENV !== 'production';
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      const hint =
        message.includes('connect') || message.includes('ECONNREFUSED')
          ? ' Vérifiez que PostgreSQL est démarré.'
          : message.includes('relation') || message.includes('does not exist')
            ? ' Exécutez les migrations : pnpm --filter @cineconnect/database run migrate'
            : '';
      res.status(500).json({
        success: false,
        message: isDev ? message + hint : 'Erreur lors de l\'inscription',
      });
    }
  }

  /**
   * POST /auth/login - Connexion email / mot de passe
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body as { email?: string; password?: string };
      if (!email?.trim() || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email et mot de passe requis',
        });
      }
      const user = await UserService.getUserByEmail(email.trim());
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect',
        });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect',
        });
      }
      const token = signToken(user);
      const { passwordHash: _, ...rest } = user;
      res.json({
        success: true,
        data: { token, user: toUserResponse(rest as { id: number; email: string; name: string; avatarUrl: string | null; bio?: string | null }) },
      });
    } catch (error) {
      console.error('Auth login error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la connexion',
      });
    }
  }

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
      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
      if (err) {
        console.error('Google callback error:', err);
        return res.redirect(`${frontendUrl}/login?error=auth_failed`);
      }
      if (!user) {
        return res.redirect(`${frontendUrl}/login?error=auth_failed`);
      }

      const token = signToken(user);
      const userPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl ?? null,
        bio: user.bio ?? null,
      };
      res.redirect(
        `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userPayload))}`
      );
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





