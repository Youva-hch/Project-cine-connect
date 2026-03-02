import { Router, type IRouter } from 'express';
import { FriendController } from '../controllers/friend.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const friendRouter: IRouter = Router();

friendRouter.get('/search', requireAuth, FriendController.searchUsers);
friendRouter.post('/request/:targetId', requireAuth, FriendController.sendRequest);
friendRouter.get('/requests', requireAuth, FriendController.getReceivedRequests);
friendRouter.get('/sent', requireAuth, FriendController.getSentRequests);
friendRouter.patch('/requests/:id/accept', requireAuth, FriendController.acceptRequest);
friendRouter.patch('/requests/:id/reject', requireAuth, FriendController.rejectRequest);
friendRouter.get('/status/:targetId', requireAuth, FriendController.getStatus);
friendRouter.get('/', requireAuth, FriendController.getFriends);
friendRouter.delete('/:friendId', requireAuth, FriendController.removeFriend);
