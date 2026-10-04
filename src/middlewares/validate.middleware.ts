import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodIssue } from 'zod';

export const validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            // Usamos .issues en lugar de .errors y tipamos 'issue' con ZodIssue
            const errorMessages = result.error.issues.map((issue: ZodIssue) => issue.message);
            return res.status(400).json({
                message: 'Error de validación en los datos enviados',
                errors: errorMessages,
            });
        }

        req.body = result.data; // req.body sanitizado
        next();
    };
};