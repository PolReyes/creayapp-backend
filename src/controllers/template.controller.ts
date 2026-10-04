import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { TemplateService } from '../services/template.service';
import { UploadServiceAdmin } from '../services/upload.service';

export const createTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const adminId = req.user!.id;
        const file = req.file;

        // 1. Obtener la URL de vista previa
        let previewUrl = req.body?.previewUrl;

        // Si viene un archivo subido, lo enviamos a Cloudinary con tu UploadService
        if (file) {
            previewUrl = await UploadServiceAdmin.uploadBuffer(file.buffer);
        }

        // Si no hay archivo ni URL
        if (!previewUrl) {
            return res.status(400).json({
                message: 'Debes proporcionar una imagen de vista previa (archivo o previewUrl).'
            });
        }

        // 2. Parsear elements si viene como String desde FormData
        let elements = req.body?.elements;
        if (typeof elements === 'string') {
            try {
                elements = JSON.parse(elements);
            } catch {
                elements = { background: '#ffffff', layers: [] };
            }
        }

        // 3. Crear la plantilla
        const templateData = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category || 'General',
            width: req.body.width ? Number(req.body.width) : 1080,
            height: req.body.height ? Number(req.body.height) : 1080,
            previewUrl,
            elements: elements || { background: '#ffffff', layers: [] },
        };

        const template = await TemplateService.createTemplate(adminId, templateData);
        return res.status(201).json(template);

    } catch (error: any) {
        return res.status(400).json({ message: error.message || 'Error al procesar la plantilla' });
    }
};

export const getTemplates = async (req: AuthRequest, res: Response) => {
    try {
        const { category } = req.query;
        const templates = await TemplateService.getPublicTemplates(category as string);
        res.status(200).json(templates);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getTemplateById = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const template = await TemplateService.getTemplateById(id);
        res.status(200).json(template);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const deleteTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        await TemplateService.deleteTemplate(id);
        res.status(200).json({ message: 'Plantilla eliminada correctamente.' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};