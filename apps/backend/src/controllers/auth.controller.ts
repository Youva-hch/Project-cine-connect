import { Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserService } from '../services/user.service.js';

function signAccessToken(user: { id: number; email: string }) {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  return jwt.sign(
    { userId: user.id, email: user.email },
    secret,
    { expiresIn } as jwt.SignOptions
  );
}

function signRefreshToken(user: { id: number; email: string }) {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return jwt.sign(
    { userId: user.id, email: user.email, type: 'refresh' },
    secret,
    { expiresIn } as jwt.SignOptions
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
  static buildAuthPayload(user: { id: number; email: string; name: string; avatarUrl: string | null; bio?: string | null }) {
    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    return {
      token,
      refreshToken,
      user: toUserResponse(user),
    };
  }

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
      const { passwordHash: _, ...rest } = user;
      return res.status(201).json({
        success: true,
        data: AuthController.buildAuthPayload(rest as { id: number; email: string; name: string; avatarUrl: string | null; bio?: string | null }),
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
      return res.status(500).json({
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
      const { passwordHash: _, ...rest } = user;
      return res.json({
        success: true,
        data: AuthController.buildAuthPayload(rest as { id: number; email: string; name: string; avatarUrl: string | null; bio?: string | null }),
      });
    } catch (error) {
      console.error('Auth login error:', error);
      return res.status(500).json({
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
   * Redirige vers la page login avec un message d'erreur (message tronqué pour l'URL)
   */
  static redirectLoginError(res: Response, message: string) {
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const params = new URLSearchParams({ error: 'auth_failed' });
    const safeMsg = message.slice(0, 200);
    params.set('message', safeMsg);
    return res.redirect(`${frontendUrl}/auth?${params.toString()}`);
  }

  /**
   * Callback après authentification Google
   */
  static googleCallback(req: Request, res: Response) {
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

    // Erreur renvoyée par Google dans l'URL (ex: access_denied, redirect_uri_mismatch)
    const googleError = req.query.error as string | undefined;
    if (googleError) {
      const desc = (req.query.error_description as string) || googleError;
      console.error('Google OAuth error from redirect:', googleError, desc);
      const msg =
        googleError === 'access_denied'
          ? 'Connexion annulée'
          : googleError === 'redirect_uri_mismatch'
            ? 'URL de redirection incorrecte (vérifiez Google Cloud Console)'
            : desc;
      return AuthController.redirectLoginError(res, msg);
    }

    passport.authenticate('google', { session: false }, (err: unknown, user: unknown) => {
      if (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Google callback error:', msg, err instanceof Error ? err.stack : '');
        return AuthController.redirectLoginError(res, msg);
      }
      if (!user) {
        console.error('Google callback: no user returned from strategy (check strategy logs above)');
        return AuthController.redirectLoginError(res, 'Aucun utilisateur retourné');
      }

      const u = user as { id: number; email: string; name: string; avatarUrl?: string | null; bio?: string | null };
      const token = signAccessToken(u);
      const refreshToken = signRefreshToken(u);
      const userPayload = {
        id: u.id,
        email: u.email,
        name: u.name,
        avatarUrl: u.avatarUrl ?? null,
        bio: u.bio ?? null,
      };
      res.redirect(
        `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refreshToken)}&user=${encodeURIComponent(JSON.stringify(userPayload))}`
      );
    })(req, res);
  }

  /**
   * Renouvelle un access token via refresh token
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.body?.refreshToken as string | undefined;
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token manquant',
        });
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key'
      ) as { userId?: number; id?: number; email?: string; type?: string };

      const userId = decoded.userId ?? decoded.id;
      if (!userId || (decoded.type && decoded.type !== 'refresh')) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token invalide',
        });
      }

      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      const { passwordHash, ...rest } = user;
      return res.json({
        success: true,
        data: AuthController.buildAuthPayload(rest as { id: number; email: string; name: string; avatarUrl: string | null; bio?: string | null }),
      });
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalide',
      });
    }
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

      return res.json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
      });
    }
  }
}





