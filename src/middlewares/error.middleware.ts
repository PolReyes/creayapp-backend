import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'El archivo excede el límite máximo de 5MB por foto.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ message: 'Solo puedes subir un máximo de 4 imágenes adjuntas.' });
        }
        return res.status(400).json({ message: `Error al subir archivo: ${err.message}` });
    }

    if (err.message && err.message.includes('Solo se permiten archivos de imagen')) {
        return res.status(400).json({ message: err.message });
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Error interno en el servidor.',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};