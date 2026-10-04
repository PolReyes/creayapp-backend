import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import templateRoutes from './routes/template.routes';
import aiRoutes from './routes/ai.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

// Security Headers
app.use(helmet());

// CORS Configurado
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173', // Puerto por defecto de Vite / React
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/ai', aiRoutes);

// Middleware Global de Errores (Siempre debe ir al final de las rutas)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor seguro corriendo en el puerto ${PORT}`);
});