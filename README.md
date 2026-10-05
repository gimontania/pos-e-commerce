//readMe hecho con ayuda

POS & E-commerce

Sistema híbrido de Punto de Venta (POS) y Comercio Electrónico desarrollado con NestJS, TypeScript, Prisma y PostgreSQL.

Tecnologías

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- JWT
- Swagger
- pnpm

Instalación local

bash
git clone https://github.com/gimontania/pos-e-commerce.git
cd POS-E-commerce
pnpm install

Crear un archivo `.env` con las variables necesarias:

env
DATABASE_URL="postgresql://usuario:password@localhost:5432/pos_ecommerce"
JWT_SECRET="tu_secreto"
PORT=3000

Ejecutar las migraciones:

bash
pnpm prisma migrate dev

Generar Prisma Client:

bash
pnpm prisma generate

Ejecutar el seed:

bash
pnpm prisma db seed

Iniciar la aplicación:

bash
pnpm start:dev

Swagger

Local:

http://localhost:3000/api/docs

Producción

API en Render:


Base de datos: Supabase PostgreSQL.

Repositorio

https://github.com/gimontania/pos-e-commerce.git
