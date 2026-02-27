import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@cineconnect.com')
  .split(',')
  .map((e) => e.trim().toLowerCase());

/**
 * Middleware qui vérifie le JWT et attache userId / userEmail à la requête.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Token manquant',
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { userId: number; email: string };
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Token invalide',
    });
  }
}

/**
 * Middleware qui exige une authentification et un rôle admin (email dans ADMIN_EMAILS).
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    const email = req.userEmail?.toLowerCase();
    if (!email || !ADMIN_EMAILS.includes(email)) {
      res.status(403).json({
        success: false,
        message: 'Accès réservé aux administrateurs',
      });
      return;
    }
    next();
  });
}
