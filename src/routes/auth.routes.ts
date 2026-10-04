import { Router } from 'express';
import { register, login, getMe, googleLoginController } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Rutas Públicas
router.post('/register', register);
router.post('/login', login);

// Ruta Protegida (Cualquier usuario autenticado)
router.get('/me', authenticateToken, getMe);

// Ruta Protegida (Ejemplo: Solo Administradores)
router.get('/admin/dashboard', authenticateToken, requireRole(['ADMIN']), (req, res) => {
    res.json({ message: 'Bienvenido al panel de administración' });
});

router.post('/google', googleLoginController);

export default router;