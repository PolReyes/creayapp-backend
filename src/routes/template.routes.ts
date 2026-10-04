import { Router } from 'express';
import {
    createTemplate,
    getTemplates,
    getTemplateById,
    deleteTemplate,
} from '../controllers/template.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // Guarda el buffer en memoria

// Rutas Públicas para Usuarios Autenticados
router.get('/', authenticateToken, getTemplates);
router.get('/:id', authenticateToken, getTemplateById);

// Rutas Exclusivas para Administradores
router.post('/', authenticateToken, requireRole(['ADMIN']), upload.single('file'), createTemplate);
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), deleteTemplate);



// Agregar 'upload.single("file")' antes del controlador


export default router;