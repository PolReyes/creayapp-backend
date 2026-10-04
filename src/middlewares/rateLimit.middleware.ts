import rateLimit from 'express-rate-limit';

export const aiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
    max: 5, // Máximo 5 generaciones por ventana por IP
    message: {
        message: 'Has alcanzado el límite máximo de generaciones de imágenes por ahora. Intenta de nuevo en 15 minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});