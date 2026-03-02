import { Router, type IRouter } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const notificationRouter: IRouter = Router();

notificationRouter.get('/', requireAuth, NotificationController.list);
notificationRouter.get('/count', requireAuth, NotificationController.count);
notificationRouter.patch('/read-all', requireAuth, NotificationController.markAllRead);
notificationRouter.patch('/:id/read', requireAuth, NotificationController.markRead);
