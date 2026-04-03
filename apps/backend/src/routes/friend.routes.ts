import { Router, type IRouter } from 'express';
import { FriendController } from '../controllers/friend.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  targetIdParamSchema,
  friendshipIdParamSchema,
  friendIdParamSchema,
  searchUsersQuerySchema,
} from '../validators/schemas.js';

export const friendRouter: IRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Amis
 *   description: Système d'amis
 */

/**
 * @swagger
 * /api/friends/search:
 *   get:
 *     summary: Rechercher des utilisateurs
 *     tags: [Amis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom ou email à chercher
 *     responses:
 *       200:
 *         description: Liste d'utilisateurs correspondants
 *       401:
 *         description: Non authentifié
 */
friendRouter.get('/search', requireAuth, validate(searchUsersQuerySchema), FriendController.searchUsers);

/**
 * @swagger
 * /api/friends/request/{targetId}:
 *   post:
 *     summary: Envoyer une demande d'ami
 *     tags: [Amis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur à ajouter
 *     responses:
 *       201:
 *         description: Demande envoyée
 *       400:
 *         description: Demande déjà existante
 *       401:
 *         description: Non authentifié
 */
friendRouter.post('/request/:targetId', requireAuth, validate(targetIdParamSchema), FriendController.sendRequest);

/**
 * @swagger
 * /api/friends/requests:
 *   get:
 *     summary: Voir les demandes d'amis reçues
 *     tags: [Amis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des demandes en attente
 *       401:
 *         description: Non authentifié
 */
friendRouter.get('/requests', requireAuth, FriendController.getReceivedRequests);

/**
 * @swagger
 * /api/friends/sent:
 *   get:
 *     summary: Voir les demandes d'amis envoyées
 *     tags: [Amis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des demandes envoyées
 *       401:
 *         description: Non authentifié
 */
friendRouter.get('/sent', requireAuth, FriendController.getSentRequests);

/**
 * @swagger
 * /api/friends/requests/{id}/accept:
 *   patch:
 *     summary: Accepter une demande d'ami
 *     tags: [Amis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la demande
 *     responses:
 *       200:
 *         description: Demande acceptée
 *       404:
 *         description: Demande introuvable
 */
friendRouter.patch('/requests/:id/accept', requireAuth, validate(friendshipIdParamSchema), FriendController.acceptRequest);

/**
 * @swagger
 * /api/friends/requests/{id}/reject:
 *   patch:
 *     summary: Refuser une demande d'ami
 *     tags: [Amis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la demande
 *     responses:
 *       200:
 *         description: Demande refusée
 *       404:
 *         description: Demande introuvable
 */
friendRouter.patch('/requests/:id/reject', requireAuth, validate(friendshipIdParamSchema), FriendController.rejectRequest);

/**
 * @swagger
 * /api/friends/status/{targetId}:
 *   get:
 *     summary: Voir le statut d'amitié avec un utilisateur
 *     tags: [Amis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Statut de la relation (pending, accepted, rejected, none)
 *       401:
 *         description: Non authentifié
 */
friendRouter.get('/status/:targetId', requireAuth, validate(targetIdParamSchema), FriendController.getStatus);

/**
 * @swagger
 * /api/friends:
 *   get:
 *     summary: Liste de mes amis
 *     tags: [Amis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des amis acceptés
 *       401:
 *         description: Non authentifié
 */
friendRouter.get('/', requireAuth, FriendController.getFriends);

/**
 * @swagger
 * /api/friends/{friendId}:
 *   delete:
 *     summary: Supprimer un ami
 *     tags: [Amis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ami supprimé
 *       404:
 *         description: Ami introuvable
 */
friendRouter.delete('/:friendId', requireAuth, validate(friendIdParamSchema), FriendController.removeFriend);
