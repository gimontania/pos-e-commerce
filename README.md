//readMe hecho con ayuda

POS & E-commerce

Sistema híbrido de Punto de Venta (POS) y Comercio Electrónico desarrollado con NestJS, TypeScript, Prisma y PostgreSQL.

El sistema permite gestionar usuarios y roles, catálogo de productos, ventas POS, carrito de compras, pedidos e-commerce y apertura/cierre de caja con conciliación de efectivo.

Tecnologías

* NestJS
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT
* Swagger
* pnpm
* Render
* Supabase

Funcionalidades principales

Autenticación y roles

* Registro de clientes.
* Login mediante JWT.
* Roles:

  * ADMIN
  * CAJERO
  * CLIENTE
* Protección de endpoints mediante `JwtAuthGuard` y `RolesGuard`.
* La identidad del usuario se obtiene desde el JWT y no desde el body.

Catálogo

* CRUD de categorías.
* CRUD de productos.
* Filtrado por categoría.
* Catálogo público.
* El catálogo público no expone el precio de compra.
* Los productos sin stock no se muestran en el catálogo público.

Punto de Venta (POS)

* Apertura de caja por turno.
* Registro de ventas.
* Múltiples productos por venta.
* Validación de stock.
* Descuento automático del stock.
* Métodos de pago:

  * EFECTIVO
  * TARJETA
  * TRANSFERENCIA_QR
* Historial de ventas.
* Transacciones con Prisma para mantener la consistencia de la venta y el stock.

MockPay

Para TARJETA y TRANSFERENCIA_QR se utiliza un servicio interno MockPay que simula la aprobación de un proveedor de pagos externo.

El pago se procesa antes de crear la venta. Si el pago es rechazado, la venta no se crea.

El pago en efectivo no utiliza MockPay.

Caja y conciliación

* Apertura de caja indicando el monto inicial.
* Cierre de caja indicando el efectivo contado.
* Cálculo de:

  * monto inicial
  * ventas en efectivo
  * efectivo esperado
  * efectivo contado
  * diferencia
* Las ventas con tarjeta o transferencia QR no se consideran efectivo físico.

E-commerce

* Carrito de compras.
* Agregado y modificación de productos del carrito.
* Creación de pedidos.
* Dirección del cliente almacenada como snapshot en el pedido.
* Estados de pedido:

  * PENDIENTE
  * PAGADO
  * EN_CAMINO
  * ENTREGADO
  * CANCELADO
* Origen del pedido:

  * WEB
  * FACEBOOK
  * INSTAGRAM
  * MANUAL

Producción

API desplegada en Render

https://pos-e-commerce-owcx.onrender.com

Swagger de producción:

https://pos-e-commerce-owcx.onrender.com/api/docs

Base de datos:PostgreSQL en Supabase.

Credenciales de demostración

Estas credenciales corresponden a usuarios de prueba creados mediante el seed de producción.

| Rol     | Email               | Contraseña     |
| ------- | ------------------- | -------------- |
| ADMIN   | `admin@gmail.com`   | `Admin1234!`   |
| CAJERO  | `cajero@gmail.com`  | `Cajero1234!`  |
| CLIENTE | `cliente@gmail.com` | `Cliente1234!` |

> Son credenciales de demostración del proyecto. No utilizar estas contraseñas para cuentas reales.

Ejemplos de flujo para la demo

Flujo ADMIN

1. Login mediante `POST /auth/login`.
2. Autorizar el JWT en Swagger.
3. Consultar `GET /sales`.
4. El ADMIN puede consultar el historial de ventas.

Flujo CLIENTE

1. Login mediante `POST /auth/login`.
2. Autorizar el JWT en Swagger.
3. Intentar acceder a `GET /sales`.
4. El endpoint responde `403 Forbidden` porque CLIENTE no tiene permisos para consultar ventas.

Flujo CAJERO / POS

1. Login como CAJERO.
2. Abrir caja mediante `POST /sales/caja/abrir`.
3. Registrar una venta mediante `POST /sales`.
4. Validar stock.
5. Si el pago es con tarjeta o QR, se procesa mediante MockPay.
6. Crear la venta.
7. Descontar las unidades vendidas del stock.
8. Cerrar la caja mediante `POST /sales/caja/cerrar`.
9. Comparar el efectivo contado con el efectivo esperado.

Flujo E-commerce

1. Cliente consulta productos.
2. Cliente agrega productos al carrito.
3. Cliente consulta su carrito.
4. Cliente crea un pedido.
5. Se registra el origen del pedido y el estado correspondiente.
6. El pedido puede avanzar por los diferentes estados definidos por el sistema.

Instalación local

1. Clonar el repositorio
bash
git clone https://github.com/gimontania/pos-e-commerce.git
cd pos-e-commerce


2. Instalar dependencias
bash
pnpm install


3. Configurar variables de entorno
Crear un archivo `.env`:

env
DATABASE_URL="postgresql://usuario:password@localhost:5432/pos_ecommerce"
JWT_SECRET="tu_secreto"
PORT=3000


4. Ejecutar migraciones
bash
pnpm prisma migrate dev


5. Generar Prisma Client
bash
pnpm prisma generate


6. Ejecutar el seed
bash
pnpm prisma db seed


7. Iniciar la aplicación
bash
pnpm start:dev


Swagger

Una vez iniciada la aplicación local:


http://localhost:3000/api/docs


La documentación permite probar los endpoints de la API y utilizar autenticación mediante Bearer Token.

Base de datos

El proyecto utiliza PostgreSQL y Prisma ORM.

En producción la base de datos se encuentra alojada en Supabase.

Las migraciones se encuentran dentro de:


prisma/migrations


El seed de datos de demostración se encuentra en:

prisma/seed.ts


Estructura principal


src/
├── auth/
├── cart/
├── categories/
├── customers/
├── orders/
├── payments/
├── products/
├── prisma/
├── sales/
└── users/

prisma/
├── migrations/
├── schema.prisma
└── seed.ts


Repositorio

https://github.com/gimontania/pos-e-commerce.git
