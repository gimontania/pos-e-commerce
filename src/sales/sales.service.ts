import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockPayService } from '../payments/mock-pay.service';
 



@Injectable()
export class SalesService {
    constructor(
        //permite usar prisma dentro del service
        private readonly prisma: PrismaService,
        private readonly mockpay: MockPayService,
    ) {}

    async validarCaja(cashRegisterId: number) {
        //buscamos la caja indicada
        const caja = await this.prisma.cashRegister.findUnique({
            where: {
                id: cashRegisterId,
            },
        });

        //si la caja no existe, no podemos realizar la venta
        if (!caja) {
            throw new BadRequestException('La caja no existe');
        }

        //si la caja está cerrada, no podemos realizar la venta
        if (caja.status !== 'ABIERTA') {
            throw new BadRequestException('La caja está cerrada');
        }

        //devolvemos la caja para usarla después
        return caja;
    }

    async obtenerProducto(productoId: number) {
        //buscamos el producto por su id
        const producto = await this.prisma.product.findUnique({
            where: {
                id: productoId,
            },
        });

        //si el producto no existe, no podemos venderlo
        if (!producto) {
            throw new BadRequestException('El producto no existe');
        }

        //devolvemos el producto para usar su precio y stock
        return producto;
    }

    async validarStock(producto: any, cantidad: number) {
        //la cantidad debe ser mayor a cero
        if (cantidad <= 0) {
            throw new BadRequestException(
                'La cantidad debe ser mayor a cero',
            );
        }

        //no permitimos vender más unidades de las disponibles
        if (producto.stock < cantidad) {
            throw new BadRequestException(
                `Stock insuficiente para el producto ${producto.name}`,
            );
        }
    }

    async crearVenta(
        createSaleDto: {
            cashRegisterId: number;
            paymentMethod: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA_QR';
            items: {
                productId: number;
                quantity: number;
            } [];
        },
        userId: number,
    ) {
        //validamos que la caja esté abierta
        await this.validarCaja(createSaleDto.cashRegisterId);
        //guardamos los productos que forman parte de la venta
        const itemsVenta : {
            productId: number;
            quantity: number;
            unitPrice: any;
            subtotal: number;
        }[] = [];

        //recorremos cada produtco enviado
        for (const item of createSaleDto.items) {
            //buscamos el producto en la base de datos
            const producto = await this.obtenerProducto(item.productId);

            //verificamosque haya stock suficiente
            await this.validarStock(producto, item.quantity);

            //calculamos el subtotal de este producto
            const subtotal = Number(producto.salePrice) * item.quantity;

            //guardamos los datos necesarios para crear el detalle
            itemsVenta.push({
               productId: producto.id,
              quantity: item.quantity,
              unitPrice: producto.salePrice,
              subtotal: subtotal,
        });
    }    

    //sumamos los subtotales para obtener el total de la venta
    const total = itemsVenta.reduce(
        (acumulado, item) => acumulado + item.subtotal,
        0,
    );

    //si no es efectivo, simulamos el pago externo
    if (createSaleDto.paymentMethod !== 'EFECTIVO') {
    const pago = await this.mockpay.procesarPago(
    total,
    createSaleDto.paymentMethod,
    );

  if (!pago.aprobado) {
    throw new BadRequestException('Pago rechazado');
  }
    }


    //iniciamos una transacción para que todos los cambios sean atómicos
    return this.prisma.$transaction(async (tx) => {
        //creamos la venta principal
        const venta = await tx.sale.create({
            data: {
                userId: userId,
                cashRegisterId: createSaleDto.cashRegisterId,
                paymentMethod: createSaleDto.paymentMethod,
                total: total,
            },
        });

        //creamos cada detalle de la venta
        for (const item of itemsVenta) {
            await tx.saleItem.create({
                data: {
                    saleId: venta.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                },
            });
        }
    //descontaremos el stock de cada producto
     for (const item of itemsVenta) {
            await tx.product.update({
            where: {
                id: item.productId,
            },
            data: {
                stock: {
                    decrement: item.quantity,
                },
            },
        });
    }

    //devolvemos la venta creada con sus detalles
    return tx.sale.findUnique({
        where: {
            id: venta.id,            
        },
        include: {
            items: true,
        },
    });
    });
    }

    async abrirCaja(userId: number, openingAmount: number) {
        //verificamos que el monto inicial no sea negativo
        if (openingAmount < 0) {
            throw new BadRequestException(
                'El monto inicial no puede ser negativo',
            );
        }

        //verificamos que el usuario exista
        const usuario = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        //si el usuario no existe, no podemos abrir la caja
        if (!usuario) {
            throw new BadRequestException('El usuario no existe');
        }

        //verificamos si el usuario ya tiene una caja abierta
        const cajaAbierta = await this.prisma.cashRegister.findFirst({
            where: {
                userId,
                status: 'ABIERTA',
            },
        });

        //no permitimos tener dos cajas abiertas al mismo tiempo
        if (cajaAbierta) {
            throw new BadRequestException(
                'El usuario ya tiene una caja abierta',                
            );
        }

        //creamos la nueva caja
        return this.prisma.cashRegister.create({
            data: {
                userId,
                openingAmount,
                status: 'ABIERTA',
            },
        });
    }

    async cerrarCaja(userId: number, closingAmount: number) {
        //el efectivo contado no puede ser negativo
        if (closingAmount < 0) {
            throw new BadRequestException(
                'El monto de cierre no puede ser negativo',
            );
        }

        //buscamos la caja abierta del usuario
        const caja = await this.prisma.cashRegister.findFirst({
            where: {
                userId,
                status: 'ABIERTA',
            },            
        });

        //si no existe la caja abierta, no podemos cerrarla
        if (!caja) {
            throw new BadRequestException(
                'El usuario no tiene una caja abierta',
            );
        }

        //sumamos solamente las ventas pagadas en efectivo
        const ventasEfectivo = await this.prisma.sale.aggregate({
            where: {
                cashRegisterId: caja.id,
                paymentMethod: 'EFECTIVO',
            },
            _sum: {
                total: true,
            },
        });

        //obtenemos el total vendido en efectivo
        const totalEfectivo = Number(ventasEfectivo._sum.total ?? 0);

        //calculamos cuánto dinero debería haber físicamente
        const efectivoEsperado = Number(caja.openingAmount) + totalEfectivo;

        //calculamos la diferencia entre lo esperado y lo contado
        const diferencia = closingAmount - efectivoEsperado;

        //cerramos la caja y guardamos el monto contado
        const cajaCerrada = await this.prisma.cashRegister.update({
            where: {
                id: caja.id,
            },
            data: {
                closingAmount,
                status: 'CERRADA',
                closedAt: new Date(),
            },
        });

        //devolvemos la información de la conciliación
        return {
            caja: cajaCerrada,
            resumen: {
                montoInicial: Number(caja.openingAmount),
                ventasEfectivo: totalEfectivo,
                efectivoEsperado,
                efectivoContado: closingAmount,
                diferencia,
            },
        };

    }

    //obtenemos el historial de ventas
    async obtenerVentas() {
        return this.prisma.sale.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                items: true,
            },
        });
    }
    
}


































