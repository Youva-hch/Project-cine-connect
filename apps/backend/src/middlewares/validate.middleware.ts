import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware factory: valide req.body, req.query et req.params
 * selon un schéma Zod puis injecte les données parsées dans la requête.
 */
export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Re-inject parsed (coerced / trimmed) values
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => e.message);
        return res.status(400).json({
          success: false,
          message: messages[0],
          errors: messages,
        });
      }
      return next(error);
    }
  };
}
