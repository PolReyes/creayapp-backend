import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

export class AuthService {
  static async register(data: { name: string; email: string; password: string }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: Role.USER, // Rol asignado por defecto
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return { user, token };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    // Si el usuario no existe o se registró exclusivamente con Google (password es null)
    if (!user || !user.password) {
      throw new Error('Credenciales inválidas.');
    }

    // TypeScript reconoce automáticamente que user.password es de tipo 'string' aquí
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error('Credenciales inválidas.');
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) throw new Error('Usuario no encontrado.');
    return user;
  }

  static async googleLogin(idToken: string) {
    // 1. Verificar el token con las claves públicas de Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Token de Google inválido');
    }

    const { email, name, picture, sub: googleId } = payload;

    // 2. Buscar si el usuario ya existe
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // 3. Si no existe, lo creamos
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0], // Si no trae nombre de Google, usa el prefijo del correo
          avatarUrl: picture || null,
          googleId,
          password: null, // Ya permitido tras actualizar schema.prisma
          role: 'USER',
        },
      });
    } else if (!user.googleId) {
      // Si existía con login tradicional, vinculamos su googleId
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          avatarUrl: user.avatarUrl || picture || null
        },
      });
    }

    // 4. Generar tu propio JWT de sesión
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '7d' }
    );

    return { token, user };
  }
}
