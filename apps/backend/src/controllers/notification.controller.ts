import { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { NotificationService } from '../services/notification.service.js';

export class NotificationController {
  static async list(req: AuthRequest, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    try {
      const notifs = await NotificationService.listNotifications(req.userId);
      return res.json({ success: true, data: notifs });
    } catch (error) {
      console.error('NotificationController.list error:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  static async count(req: AuthRequest, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    try {
      const count = await NotificationService.getUnreadCount(req.userId);
      return res.json({ success: true, data: { count } });
    } catch (error) {
      console.error('NotificationController.count error:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  static async markRead(req: AuthRequest, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      await NotificationService.markAsRead(id, req.userId);
      return res.json({ success: true });
    } catch (error) {
      console.error('NotificationController.markRead error:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  static async markAllRead(req: AuthRequest, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    try {
      await NotificationService.markAllAsRead(req.userId);
      return res.json({ success: true });
    } catch (error) {
      console.error('NotificationController.markAllRead error:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
}
