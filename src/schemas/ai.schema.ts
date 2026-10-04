import { z } from 'zod';

export const generateBannerSchema = z.object({
    topic: z
        .string('El campo topic es obligatorio')
        .min(3, 'El tema debe tener al menos 3 caracteres')
        .max(500, 'El tema no puede exceder 500 caracteres'),
    title: z.string().max(150, 'El título no puede exceder 150 caracteres').optional(),
    subtitle: z.string().max(200, 'El subtítulo no puede exceder 200 caracteres').optional(),
    companyName: z.string().max(100, 'El nombre de empresa no puede exceder 100 caracteres').optional(),
    phone: z.string().max(30, 'El teléfono no puede exceder 30 caracteres').optional(),
    primaryColor: z.string().max(50, 'El color no puede exceder 50 caracteres').optional(),
});