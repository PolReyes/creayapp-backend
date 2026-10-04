import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@admin.com';

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin12345', 10);
        await prisma.user.create({
            data: {
                name: 'Super Admin',
                email: adminEmail,
                password: hashedPassword,
                role: Role.ADMIN,
            },
        });
        console.log('Usuario Admin creado exitosamente.');
    } else {
        console.log('El usuario Admin ya existe.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });