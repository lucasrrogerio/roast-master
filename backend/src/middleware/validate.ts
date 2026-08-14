import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        res.status(400).json({
          error: `Dados inválidos: ${errorMessages}`,
          details: error.errors,
        });
        return;
      }
      res.status(400).json({ error: 'Erro de validação dos dados de entrada' });
    }
  };
}
