import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";


const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    //roles base de la aplicación
    await prisma.role.createMany({
        data: [
            { name: "ADMIN" },
            { name: "CAJERO" },
            { name: "CLIENTE" },
        ],
        skipDuplicates: true,
    });

    //buscamos el rol ADMIN que acabamos de crear
    const rolAdmin = await prisma.role.findUnique({
        where: {
            name: "ADMIN",
        },
    });

    //si no existe, detenemos el seed
    if (!rolAdmin){
        throw new Error("El rol ADMIN no existe");
    }

    //creamos el hash de la contraseña del administrador
    const passwordHash = await bcrypt.hash("Admin1234!", 10);

    //creamos el usuario ADMIN
    await prisma.user.upsert({
        where: {
            email: "admin@gmail.com",
        },
        update: {},
        create: {
            name: "Administrador",
            email: "admin@gmail.com",
            passwordHash,
            roleId: rolAdmin.id,
        },
    });
}

main()
.then(async () => {
    await prisma.$disconnect();
})
.catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});















