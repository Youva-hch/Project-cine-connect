import { Router, type IRouter } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const notificationRouter: IRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notifications utilisateur
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Récupérer mes notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications (non lues en premier)
 *       401:
 *         description: Non authentifié
 */
notificationRouter.get('/', requireAuth, NotificationController.list);

/**
 * @swagger
 * /api/notifications/count:
 *   get:
 *     summary: Nombre de notifications non lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de notifications non lues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Non authentifié
 */
notificationRouter.get('/count', requireAuth, NotificationController.count);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Marquer toutes les notifications comme lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Toutes les notifications marquées comme lues
 *       401:
 *         description: Non authentifié
 */
notificationRouter.patch('/read-all', requireAuth, NotificationController.markAllRead);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *       404:
 *         description: Notification introuvable
 *       401:
 *         description: Non authentifié
 */
notificationRouter.patch('/:id/read', requireAuth, NotificationController.markRead);
