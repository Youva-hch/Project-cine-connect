import { Request, Response, CookieOptions } from 'express';
import crypto from 'crypto';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserService } from '../services/user.service.js';
import { EmailService } from '../services/email.service.js';

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

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

function refreshTokenCookieMaxAge() {
  const fallbackMs = 7 * 24 * 60 * 60 * 1000;
  const raw = (process.env.JWT_REFRESH_COOKIE_MAX_AGE || '').trim();
  if (!raw) return fallbackMs;

  if (/^\d+$/.test(raw)) {
    return Number(raw);
  }

  const match = raw.match(/^(\d+)([smhd])$/i);
  if (!match) return fallbackMs;

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multiplierByUnit: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multiplierByUnit[unit];
}

function getRefreshTokenCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';
  const domain = process.env.COOKIE_DOMAIN?.trim() || undefined;
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: refreshTokenCookieMaxAge(),
    ...(domain ? { domain } : {}),
  };
}

function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshTokenCookieOptions());
}

function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    ...getRefreshTokenCookieOptions(),
    maxAge: undefined,
    expires: new Date(0),
  });
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

function getFrontendBaseUrl() {
  return (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
}

function hashResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Contrôleur pour gérer l'authentification
 */
export class AuthController {
  static issueTokens(user: { id: number; email: string }) {
    return {
      token: signAccessToken(user),
      refreshToken: signRefreshToken(user),
    };
  }

  static buildAuthPayload(user: { id: number; email: string; name: string; avatarUrl: string | null; bio?: string | null }) {
    const { token } = AuthController.issueTokens(user);
    return {
      token,
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
      const { refreshToken } = AuthController.issueTokens(rest as { id: number; email: string });
      setRefreshTokenCookie(res, refreshToken);
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
      const { refreshToken } = AuthController.issueTokens(rest as { id: number; email: string });
      setRefreshTokenCookie(res, refreshToken);
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
   * POST /auth/forgot-password - Envoie un email de reset password
   */
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body as { email?: string };
      const normalizedEmail = email?.trim();

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email requis',
        });
      }

      const user = await UserService.getUserByEmail(normalizedEmail);
      if (!user) {
        return res.json({
          success: true,
          message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = hashResetToken(resetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await UserService.setPasswordResetToken(user.id, resetTokenHash, expiresAt);

      const frontendUrl = getFrontendBaseUrl();
      const params = new URLSearchParams({
        mode: 'reset',
        token: resetToken,
        email: user.email,
      });
      const resetLink = `${frontendUrl}/auth?${params.toString()}`;

      await EmailService.sendPasswordResetEmail({
        to: user.email,
        recipientName: user.name,
        resetLink,
      });

      return res.json({
        success: true,
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Impossible d\'envoyer l\'email de réinitialisation',
      });
    }
  }

  /**
   * POST /auth/reset-password - Met à jour le mot de passe via token
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, token, password } = req.body as {
        email?: string;
        token?: string;
        password?: string;
      };

      const normalizedEmail = email?.trim();
      const normalizedToken = token?.trim();

      if (!normalizedEmail || !normalizedToken || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email, token et nouveau mot de passe requis',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 6 caractères',
        });
      }

      const user = await UserService.getUserByEmail(normalizedEmail);
      if (!user || !user.passwordResetTokenHash || !user.passwordResetTokenExpiresAt) {
        return res.status(400).json({
          success: false,
          message: 'Lien de réinitialisation invalide ou expiré',
        });
      }

      if (user.passwordResetTokenExpiresAt.getTime() < Date.now()) {
        await UserService.clearPasswordResetToken(user.id);
        return res.status(400).json({
          success: false,
          message: 'Lien de réinitialisation invalide ou expiré',
        });
      }

      const providedTokenHash = hashResetToken(normalizedToken);
      if (providedTokenHash !== user.passwordResetTokenHash) {
        return res.status(400).json({
          success: false,
          message: 'Lien de réinitialisation invalide ou expiré',
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      await UserService.updatePassword(user.id, passwordHash);

      return res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Impossible de réinitialiser le mot de passe',
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
    const frontendUrl = getFrontendBaseUrl();
    const params = new URLSearchParams({ error: 'auth_failed' });
    const safeMsg = message.slice(0, 200);
    params.set('message', safeMsg);
    return res.redirect(`${frontendUrl}/auth?${params.toString()}`);
  }

  /**
   * Callback après authentification Google
   */
  static googleCallback(req: Request, res: Response) {
    const frontendUrl = getFrontendBaseUrl();

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
      const { token, refreshToken } = AuthController.issueTokens(u);
      setRefreshTokenCookie(res, refreshToken);
      const userPayload = {
        id: u.id,
        email: u.email,
        name: u.name,
        avatarUrl: u.avatarUrl ?? null,
        bio: u.bio ?? null,
      };
      res.redirect(
        `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userPayload))}`
      );
    })(req, res);
  }

  /**
   * Renouvelle un access token via refresh token
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
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

      const { passwordHash: _passwordHash, ...rest } = user;
      const { refreshToken: newRefreshToken } = AuthController.issueTokens(rest as { id: number; email: string });
      setRefreshTokenCookie(res, newRefreshToken);
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
   * POST /auth/logout - Invalide la session en supprimant le cookie refresh token
   */
  static async logout(_req: Request, res: Response) {
    clearRefreshTokenCookie(res);
    return res.json({
      success: true,
      message: 'Déconnexion réussie',
    });
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
      const { passwordHash: _passwordHash, ...userWithoutPassword } = user;

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





