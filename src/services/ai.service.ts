import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const prisma = new PrismaClient();

// Tipos permitidos para el tamaño según el destino publicitario
export type BannerFormat = 'square' | 'vertical' | 'horizontal';

interface GenerateBannerInput {
    topic: string;
    format?: BannerFormat; // 'square' | 'vertical' | 'horizontal'
    title?: string;
    subtitle?: string;
    companyName?: string;
    phone?: string;
    primaryColor?: string;
    assetsUrls?: string[];
}

export class AIService {
    static async generateBanner(userId: string, data: GenerateBannerInput) {
        // 1. Mapeo de formato a resoluciones soportadas por la API
        let imageSize: '1024x1024' | '1024x1792' | '1792x1024' = '1024x1024';
        let compositionInstruction = 'Composición cuadrada equilibrada para feed.';

        if (data.format === 'vertical') {
            imageSize = '1024x1792'; // Formato 9:16 para Historias / Estados
            compositionInstruction = 'Diseño en formato vertical 9:16 (Stories/Estados), optimizado para lectura móvil de arriba a abajo.';
        } else if (data.format === 'horizontal') {
            imageSize = '1792x1024'; // Formato 16:9 para Banners / Portadas
            compositionInstruction = 'Diseño en formato horizontal 16:9 panorámico, optimizado para portadas y banners web.';
        }

        // 2. Construcción optimizada del Prompt
        let promptText = `Crea un gráfico profesional en alta resolución. Tema/Nicho: "${data.topic}". Formato y Composición: ${compositionInstruction}`;

        if (data.companyName) promptText += `\n- Empresa/Marca: "${data.companyName}"`;
        if (data.title) promptText += `\n- Título principal destacado: "${data.title}"`;
        if (data.subtitle) promptText += `\n- Subtítulo o lema: "${data.subtitle}"`;
        if (data.phone) promptText += `\n- Teléfono o contacto visible: "${data.phone}"`;
        if (data.primaryColor) promptText += `\n- Color de acento/predominante: "${data.primaryColor}"`;

        // 3. Instrucción estricta para la integración de imágenes de referencia
        if (data.assetsUrls && data.assetsUrls.length > 0) {
            promptText += `\n\nREQUISITO VISUAL OBLIGATORIO: Integra de forma armónica los productos/elementos/logos presentes en los siguientes recursos cargados:`;
            data.assetsUrls.forEach((url, index) => {
                promptText += `\n  * Recurso [${index + 1}]: ${url}`;
            });
            promptText += `\nAsegúrate de replicar la estética del producto o logo suministrado sin deformarlo.`;
        }

        promptText += `\n\nEstilo gráfico: Diseño publicitario moderno, tipografía legible, limpio, profesional y listo para redes sociales.`;

        const imageModel = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2.5';

        // 4. Llamada a OpenAI con el tamaño adaptado
        const response = await openai.images.generate({
            model: imageModel,
            prompt: promptText.trim(),
            n: 1,
            size: imageSize,
            quality: "low"
        });

        const itemData = response.data?.[0];
        if (!itemData) {
            throw new Error('La API de OpenAI no devolvió ninguna imagen.');
        }

        let finalImageUrl = itemData.url || (itemData.b64_json ? `data:image/png;base64,${itemData.b64_json}` : '');

        if (!finalImageUrl) {
            throw new Error('No se pudo obtener la imagen generada.');
        }

        // 5. Registro en Base de Datos
        return await prisma.design.create({
            data: {
                userId,
                topic: data.topic,
                title: data.title,
                subtitle: data.subtitle,
                companyName: data.companyName,
                phone: data.phone,
                primaryColor: data.primaryColor,
                generatedUrl: finalImageUrl,
                assets: data.assetsUrls || [],
            },
        });
    }

    static async getUserDesigns(userId: string) {
        return await prisma.design.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
}