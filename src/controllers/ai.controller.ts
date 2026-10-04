import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AIService } from '../services/ai.service';
import { UploadService } from '../services/upload.service';

export const generateBanner = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        // Multer adjunta los campos de texto a req.body y las fotos a req.files
        const { topic, title, subtitle, companyName, phone, primaryColor } = req.body;
        const files = req.files as Express.Multer.File[];

        if (!topic) {
            return res.status(400).json({ message: 'El campo "topic" es obligatorio.' });
        }

        // Subir cada imagen adjunta a Cloudinary y recolectar sus URLs
        const assetsUrls: string[] = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const url = await UploadService.uploadBuffer(file.buffer);
                assetsUrls.push(url);
            }
        }

        // Invocamos el servicio pasando todos los datos procesados
        const design = await AIService.generateBanner(userId, {
            topic,
            title,
            subtitle,
            companyName,
            phone,
            primaryColor,
            assetsUrls,
        });

        res.status(201).json(design);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Error al procesar la solicitud.' });
    }
};

export const getMyDesigns = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const designs = await AIService.getUserDesigns(userId);
        res.status(200).json(designs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};