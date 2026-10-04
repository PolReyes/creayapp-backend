import { Router } from 'express';
import { generateBanner, getMyDesigns } from '../controllers/ai.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { uploadAssets } from '../config/multer';
import { aiRateLimiter } from '../middlewares/rateLimit.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { generateBannerSchema } from '../schemas/ai.schema';

const router = Router();

// Endpoint para generar un nuevo banner con IA
router.post(
    '/generate',
    authenticateToken,
    aiRateLimiter,
    uploadAssets,
    validateBody(generateBannerSchema),
    generateBanner
);

// Endpoint para listar el historial de imágenes del usuario
router.get('/my-designs', authenticateToken, getMyDesigns);

export default router;