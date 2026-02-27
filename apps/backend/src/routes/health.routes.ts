import { Router, type IRouter } from 'express';
import { healthController } from '../controllers/health.controller.js';

export const healthRouter: IRouter = Router();

healthRouter.get('/', healthController.check);
healthRouter.get('/db', (req, res) => healthController.checkDb(req, res));

