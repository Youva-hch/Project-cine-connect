import { Router, type IRouter } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { Response } from 'express';
import { MessageService } from '../services/message.service.js';
import { FriendService } from '../services/friend.service.js';

export const messageRouter: IRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Messages privés entre amis
 */

/**
 * @swagger
 * /api/messages/{friendId}:
 *   get:
 *     summary: Historique de la conversation avec un ami
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'ami avec qui on veut voir la conversation
 *     responses:
 *       200:
 *         description: Liste des messages de la conversation
 *       403:
 *         description: Vous ne pouvez voir que vos conversations avec vos amis
 *       401:
 *         description: Non authentifié
 */
messageRouter.get('/:friendId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const friendId = parseInt(req.params.friendId, 10);
    if (isNaN(friendId)) return res.status(400).json({ success: false, message: 'ID invalide' });

    // Vérifier qu'ils sont amis
    const friendship = await FriendService.getFriendshipStatus(userId, friendId);
    if (!friendship || friendship.status !== 'accepted') {
      return res.status(403).json({ success: false, message: 'Vous ne pouvez voir que vos conversations avec vos amis' });
    }

    const conversation = await MessageService.getConversation(userId, friendId);

    // Marquer les messages reçus comme lus
    await MessageService.markConversationAsRead(userId, friendId);

    return res.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Erreur getConversation:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});
