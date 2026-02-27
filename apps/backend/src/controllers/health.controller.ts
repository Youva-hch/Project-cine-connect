import { Request, Response } from 'express';
import { db, sql } from '@cineconnect/database';

export const healthController = {
  check: (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'OK',
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
    });
  },

  /** Diagnostic : teste la connexion et l’existence des tables (films) */
  checkDb: async (_req: Request, res: Response) => {
    try {
      await db.execute(sql`SELECT 1 FROM films LIMIT 1`);
      return res.status(200).json({ ok: true, message: 'Table films accessible' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Health DB check failed:', msg);
      return res.status(503).json({
        ok: false,
        error: msg,
        hint: msg.includes('relation') || msg.includes('does not exist')
          ? 'Exécutez les migrations sur la MÊME base que le backend : pnpm db:migrate (vérifiez DATABASE_URL ou DB_* dans .env)'
          : undefined,
      });
    }
  },
};

