import { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { FriendService } from '../services/friend.service.js';
import { db, users } from '@cineconnect/database';

export class FriendController {
  static async sendRequest(req: AuthRequest, res: Response) {
    try {
      const senderId = req.userId!;
      const targetId = req.params.targetId as unknown as number;

      const friendship = await FriendService.sendFriendRequest(senderId, targetId);
      return res.status(201).json({ success: true, data: friendship });
    } catch (error) {
      return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Erreur' });
    }
  }

  static async getReceivedRequests(req: AuthRequest, res: Response) {
    try {
      const requests = await FriendService.listReceivedRequests(req.userId!);
      return res.json({ success: true, data: requests });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  static async getSentRequests(req: AuthRequest, res: Response) {
    try {
      const requests = await FriendService.listSentRequests(req.userId!);
      return res.json({ success: true, data: requests });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  static async acceptRequest(req: AuthRequest, res: Response) {
    try {
      const friendshipId = req.params.id as unknown as number;

      await FriendService.acceptRequest(friendshipId, req.userId!);
      return res.json({ success: true });
    } catch (error) {
      return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Erreur' });
    }
  }

  static async rejectRequest(req: AuthRequest, res: Response) {
    try {
      const friendshipId = req.params.id as unknown as number;

      await FriendService.rejectRequest(friendshipId, req.userId!);
      return res.json({ success: true });
    } catch (error) {
      return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Erreur' });
    }
  }

  static async getFriends(req: AuthRequest, res: Response) {
    try {
      const friendsList = await FriendService.listFriends(req.userId!);
      return res.json({ success: true, data: friendsList });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  static async removeFriend(req: AuthRequest, res: Response) {
    try {
      const friendId = req.params.friendId as unknown as number;

      await FriendService.removeFriend(req.userId!, friendId);
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  static async getStatus(req: AuthRequest, res: Response) {
    try {
      const targetId = req.params.targetId as unknown as number;

      const status = await FriendService.getFriendshipStatus(req.userId!, targetId);
      return res.json({ success: true, data: status });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  static async searchUsers(req: AuthRequest, res: Response) {
    try {
      const q = (req.query.q as string ?? '').trim();
      if (!q || q.length < 2) return res.json({ success: true, data: [] });

      const results = await db
        .select({ id: users.id, name: users.name, avatarUrl: users.avatarUrl, email: users.email })
        .from(users)
        .limit(20);

      const filtered = results.filter(
        (u) =>
          u.id !== req.userId &&
          (u.name.toLowerCase().includes(q.toLowerCase()) ||
            u.email.toLowerCase().includes(q.toLowerCase()))
      );

      return res.json({ success: true, data: filtered });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
}
