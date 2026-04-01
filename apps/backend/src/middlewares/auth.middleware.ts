import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthRequest } from '../types.js';

export type { AuthRequest };

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
    ) as { userId?: number; id?: number; email?: string };

    const resolvedUserId = decoded.userId ?? decoded.id;
    if (typeof resolvedUserId !== 'number' || Number.isNaN(resolvedUserId)) {
      res.status(401).json({
        success: false,
        message: 'Token invalide',
      });
      return;
    }

    req.userId = resolvedUserId;
    req.userEmail = typeof decoded.email === 'string' ? decoded.email : undefined;
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
