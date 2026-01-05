import { Request, Response } from 'express';

export const healthController = {
  check: (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'OK',
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
    });
  },
};

