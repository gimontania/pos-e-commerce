import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";


const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Iniciando seed de producción...");

    //roles
    const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  const cajeroRole = await prisma.role.upsert({
    where: { name: "CAJERO" },
    update: {},
    create: { name: "CAJERO" },
  });

  const clienteRole = await prisma.role.upsert({
    where: { name: "CLIENTE" },
    update: {},
    create: { name: "CLIENTE" },
  });

 //actualizamos solamente las credenciales de los usuarios existentes
  if (process.argv.includes("--solo-credenciales")) {
    const cuentas = [
      {
        emailAnterior: "admin@gmail.com",
        emailNuevo: "admin@mail.com",
        password: "admin123",
        roleId: adminRole.id,
      },
      {
        emailAnterior: "cajero@gmail.com",
        emailNuevo: "cajero@mail.com",
        password: "cajero123",
        roleId: cajeroRole.id,
      },
      {
        emailAnterior: "cliente@gmail.com",
        emailNuevo: "cliente@mail.com",
        password: "cliente123",
        roleId: clienteRole.id,
      },
    ];

    const actualizaciones = [];

    for (const cuenta of cuentas) {
      const anterior = await prisma.user.findUnique({
        where: { email: cuenta.emailAnterior },
      });

      const nuevo = await prisma.user.findUnique({
        where: { email: cuenta.emailNuevo },
      });

      if (anterior && nuevo && anterior.id !== nuevo.id) {
        throw new Error(`El correo ${cuenta.emailNuevo} ya pertenece a otro usuario.`);
      }

      const usuario = anterior ?? nuevo;

      if (!usuario) {
        throw new Error(`No se encontró el usuario ${cuenta.emailAnterior}.`);
      }

      const passwordHash = await bcrypt.hash(cuenta.password, 10);

      actualizaciones.push(
        prisma.user.update({
          where: { id: usuario.id },
          data: {
            email: cuenta.emailNuevo,
            passwordHash,
            roleId: cuenta.roleId,
          },
        }),
      );
    }

    await prisma.$transaction(actualizaciones);

    console.log("Las tres credenciales se actualizaron correctamente.");
    return;
  }


  //contraseñas
  const adminPassword = await bcrypt.hash("admin123", 10);
  const cajeroPassword = await bcrypt.hash("cajero123", 10);
  const clientePassword = await bcrypt.hash("cliente123", 10);

  //usuarios
  const admin = await prisma.user.upsert({
    where: { email: "admin@mail.com" },
    update: {passwordHash: adminPassword,
  roleId: adminRole.id,
},
    create: {
      name: "Administrador",
      email: "admin@mail.com",
      passwordHash: adminPassword,
      roleId: adminRole.id,
    },
  });

  const cajero = await prisma.user.upsert({
    where: { email: "cajero@mail.com" },
    update: {passwordHash: cajeroPassword,
  roleId: cajeroRole.id,
},
    create: {
      name: "Cajero Demo",
      email: "cajero@mail.com",
      passwordHash: cajeroPassword,
      roleId: cajeroRole.id,
    },
  });

  const cliente = await prisma.user.upsert({
    where: { email: "cliente@mail.com" },
    update: {passwordHash: clientePassword,
  roleId: clienteRole.id,
},
    create: {
      name: "Cliente Demo",
      email: "cliente@mail.com",
      passwordHash: clientePassword,
      roleId: clienteRole.id,
    },
  });

  //cliente web
  const customer = await prisma.customer.upsert({
    where: { userId: cliente.id },
    update: {},
    create: {
      phone: "3515551234",
      userId: cliente.id,
    },
  });

  // Dirección de prueba
  const existingAddress = await prisma.address.findFirst({
    where: { customerId: customer.id },
  });

  const address =
    existingAddress ??
    (await prisma.address.create({
      data: {
        street: "Av. Colón 1234",
        city: "Córdoba",
        province: "Córdoba",
        postalCode: "5000",
        reference: "Casa de esquina",
        customerId: customer.id,
      },
    }));

  // Carrito activo del cliente.
  const cart = await prisma.cart.upsert({
    where: { customerId: customer.id },
    update: {},
    create: {
      customerId: customer.id,
    },
  });

  //categorías
  const bebidas = await prisma.category.upsert({
    where: { name: "Bebidas" },
    update: {},
    create: { name: "Bebidas" },
  });

  const snacks = await prisma.category.upsert({
    where: { name: "Snacks" },
    update: {},
    create: { name: "Snacks" },
  });

  const almacén = await prisma.category.upsert({
    where: { name: "Almacén" },
    update: {},
    create: { name: "Almacén" },
  });

  //productos
  const cocaCola = await prisma.product.upsert({
    where: { id: 1 },
    update: {
      stock: 11,
    },
    create: {
      name: "Coca Cola 1.5L",
      description: "Gaseosa Coca Cola de 1.5 litros",
      purchasePrice: "700",
      salePrice: "1200",
      stock: 11,
      categoryId: bebidas.id,
    },
  });

  const agua = await prisma.product.upsert({
    where: { id: 2 },
    update: {
      stock: 25,
    },
    create: {
      name: "Agua Mineral 1.5L",
      description: "Agua mineral sin gas",
      purchasePrice: "400",
      salePrice: "800",
      stock: 25,
      categoryId: bebidas.id,
    },
  });

  const papas = await prisma.product.upsert({
    where: { id: 3 },
    update: {
      stock: 20,
    },
    create: {
      name: "Papas Fritas 150g",
      description: "Papas fritas clásicas",
      purchasePrice: "600",
      salePrice: "1000",
      stock: 20,
      categoryId: snacks.id,
    },
  });

  const galletitas = await prisma.product.upsert({
    where: { id: 4 },
    update: {
      stock: 18,
    },
    create: {
      name: "Galletitas Chocolate",
      description: "Galletitas con chips de chocolate",
      purchasePrice: "500",
      salePrice: "900",
      stock: 18,
      categoryId: almacén.id,
    },
  });

  //caja cerrada con venta pos
  let cashRegister = await prisma.cashRegister.findFirst({
    where: {
      userId: cajero.id,
      status: "CERRADA",
    },
    orderBy: {
      id: "asc",
    },
  });

  if (!cashRegister) {
    cashRegister = await prisma.cashRegister.create({
      data: {
        userId: cajero.id,
        openingAmount: "10000",
        closingAmount: "12400",
        status: "CERRADA",
        closedAt: new Date(),
      },
    });
  }

  // Venta POS de demostración.
  let sale = await prisma.sale.findFirst({
    where: {
      cashRegisterId: cashRegister.id,
    },
  });

  if (!sale) {
    sale = await prisma.sale.create({
      data: {
        userId: cajero.id,
        cashRegisterId: cashRegister.id,
        paymentMethod: "EFECTIVO",
        total: "2400",
        items: {
          create: [
            {
              productId: cocaCola.id,
              quantity: 2,
              unitPrice: "1200",
            },
          ],
        },
      },
    });
  }

  //carrito de demostración
  const existingCartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: papas.id,
    },
  });

  if (!existingCartItem) {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: papas.id,
        quantity: 1,
      },
    });
  }

  //pedidos e-commerce
  const existingOrders = await prisma.order.count({
    where: { customerId: customer.id },
  });

  if (existingOrders === 0) {
    await prisma.order.create({
      data: {
        customerId: customer.id,
        status: "PAGADO",
        source: "WEB",
        total: "2700",
        deliveryReference: "ENTREGA-001",
        shippingName: cliente.name,
        shippingPhone: customer.phone,
        shippingAddress: address.street,
        shippingCity: address.city,
        shippingProvince: address.province,
        shippingPostalCode: address.postalCode,
        shippingReference: address.reference,
        items: {
          create: [
            {
              productId: agua.id,
              quantity: 1,
              unitPrice: "800",
            },
            {
              productId: papas.id,
              quantity: 1,
              unitPrice: "1000",
            },
            {
              productId: galletitas.id,
              quantity: 1,
              unitPrice: "200",
            },
          ],
        },
      },
    });

    await prisma.order.create({
      data: {
        customerId: customer.id,
        status: "EN_CAMINO",
        source: "FACEBOOK",
        total: "1700",
        deliveryReference: "ENTREGA-002",
        shippingName: cliente.name,
        shippingPhone: customer.phone,
        shippingAddress: address.street,
        shippingCity: address.city,
        shippingProvince: address.province,
        shippingPostalCode: address.postalCode,
        shippingReference: address.reference,
        items: {
          create: [
            {
              productId: agua.id,
              quantity: 1,
              unitPrice: "800",
            },
            {
              productId: galletitas.id,
              quantity: 1,
              unitPrice: "900",
            },            
          ],
        },
      },
    });

    await prisma.order.create({
      data: {
        customerId: customer.id,
        status: "ENTREGADO",
        source: "INSTAGRAM",
        total: "1200",
        deliveryReference: "ENTREGA-003",
        shippingName: cliente.name,
        shippingPhone: customer.phone,
        shippingAddress: address.street,
        shippingCity: address.city,
        shippingProvince: address.province,
        shippingPostalCode: address.postalCode,
        shippingReference: address.reference,
        items: {
          create: [
            {
              productId: cocaCola.id,
              quantity: 1,
              unitPrice: "1200",
            },
          ],
        },
      },
    });
  }

  console.log("");
  console.log("Seed completado correctamente");
  console.log("");
  console.log("Usuarios de demostración:");
  console.log("ADMIN   → admin@mail.com / admin123");
  console.log("CAJERO  → cajero@mail.com / cajero123");
  console.log("CLIENTE → cliente@mail.com / cliente123");
  console.log("");
  console.log(`Venta POS creada: #${sale.id}`);
  console.log(`Cliente: ${cliente.email}`);
  console.log("");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Error ejecutando seed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
   
