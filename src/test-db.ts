import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Conectando a la base de datos...');

    // Intenta realizar una consulta a la BD
    const userCount = await prisma.user.count();
    console.log(`Conexión exitosa. Total de usuarios en la BD: ${userCount}`);
}

main()
    .catch((e) => {
        console.error('Error al conectar con la base de datos:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });