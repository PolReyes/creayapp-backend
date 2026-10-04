import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TemplateService {
    // Crear una nueva plantilla (Solo Admin)
    static async createTemplate(adminId: string, data: {
        title: string;
        description?: string;
        category: string;
        width?: number;
        height?: number;
        previewUrl: string;
        elements: any;
    }) {
        return await prisma.template.create({
            data: {
                ...data,
                createdById: adminId,
            },
        });
    }

    // Obtener todas las plantillas públicas (Para Usuarios)
    static async getPublicTemplates(category?: string) {
        return await prisma.template.findMany({
            where: {
                isPublic: true,
                ...(category ? { category } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Obtener plantilla por ID
    static async getTemplateById(id: string) {
        const template = await prisma.template.findUnique({ where: { id } });
        if (!template) throw new Error('Plantilla no encontrada.');
        return template;
    }

    // Eliminar plantilla (Solo Admin)
    static async deleteTemplate(id: string) {
        return await prisma.template.delete({ where: { id } });
    }
}