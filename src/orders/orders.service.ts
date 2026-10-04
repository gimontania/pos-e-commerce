import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '../../generated/prisma/enums';
 



@Injectable()
export class OrdersService {
    constructor(
        //permite usar prisma dentro del service
        private readonly prisma: PrismaService,
    ){}

    async crearPedido(
        createOrderDto: {
            addressId: number;
            deliveryReference?: string;
        },
        userId: number,
    ) {
        //buscamos al cliente usando el usuario autenticado
        const cliente = await this.prisma.customer.findUnique({
            where: {
                userId: userId,
            },
            include: {
                user: true,
            },
        });

        //si el usuario no tiene cliente asociado, no puede comprar
        if (!cliente) {
            throw new BadRequestException(
                'El usuario no tiene un cliente asociado',
            );
        }

        //buscamos la direccion y verificamos que pertenezca al cliente
        const direccion = await this.prisma.address.findFirst({
            where: {
                id: createOrderDto.addressId,
                customerId: cliente.id,
            },
        });

        //no permitimos usar una dirección de otro cliente
        if (!direccion) {
            throw new BadRequestException(
                'La dirección no existe o no pertenece al cliente',
            );
        }

        //buscamos le carrito con sus productos
        const carrito = await this.prisma.cart.findUnique({
            where: {
                customerId: cliente.id,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        //el carrito debe existir
        if (!carrito) {
            throw new BadRequestException(
                'El carrito no existe',
            );
        }

        //no podemos crear un pedido sin productos
        if (carrito.items.length === 0) {
            throw new BadRequestException(
                'El carrito está vacío',
            );
        }

        //calculamos el total y preparamos los detalles del pedido
        const itemsPedido: {
            productId: number,
            quantity: number,
            unitPrice: any,
            subtotal: number;
        } [] = [];

        for (const item of carrito.items) {
            //verificamos que el stock siga siendo suficiente
            if (item.product.stock < item.quantity) {
                throw new BadRequestException(
                    `Stock insuficiente para el producto ${item.product.name}`,
                );
            }

            //calculamos el subtotal
            const subtotal = Number(item.product.salePrice) * item.quantity;

            //guardamos los datos necesarios para crear el detalle
            itemsPedido.push({
                productId: item.product.id,
                quantity: item.quantity,
                unitPrice: item.product.salePrice,
                subtotal: subtotal,
            });
        }

        //sumamos los subtotales para obtener el total
        const total = itemsPedido.reduce(
            (acumulado, item) => acumulado + item.subtotal,
            0,
        );

        //iniciamos una transacción para que todos los cambios sean atómicos
        return this.prisma.$transaction(async (tx) => {
            //creamos el pedido
            const pedido = await tx.order.create({
                data: {
                    customerId: cliente.id,
                    source: 'WEB',
                    total: total,

                    //guardamos una copia de la dirección usada
                    shippingName: cliente.user.name,
                    shippingPhone: cliente.phone,
                    shippingAddress: direccion.street,
                    shippingCity: direccion.city,
                    shippingProvince: direccion.province,
                    shippingPostalCode: direccion.postalCode,
                    shippingReference: direccion.reference,
                    deliveryReference:
                    createOrderDto.deliveryReference,
                },
            });

            //creamos cada detalle del pedido
            for (const item of itemsPedido) {
                await tx.orderItem.create({
                    data: {
                        orderId: pedido.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                    },
                });
            }

            //descontamos del stock los productos comprados
            for (const item of itemsPedido) {
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

            //vaciamos el carrito despues de crear el pedido
            await tx.cartItem.deleteMany({
                where: {
                    cartId: carrito.id,
                },
            });

            //devolvemos el pedido creado con sus detalles
            return tx.order.findUnique({
                where: {
                    id: pedido.id,
                },
                include: {
                    items: true,
                },
            });
        });
    }

    //obtenemos los pedidos para la logistica
    async obtenerPedidos() {
        return this.prisma.order.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                customer: {
                    include: {
                        user: true,
                    },
                },
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    //actualizamos el estado de un pedido
    async actualizarEstado(id: number, status: OrderStatus) {
        //verificamos que el pedido exista
        const pedido = await this.prisma.order.findUnique({
            where:{
                id,                
            },
        });

        if (!pedido) {
            throw new BadRequestException('El pedido no existe');
        }

        //actualizamos el estado
        return this.prisma.order.update({
            where: {
                id,
            },
            data: {
                status,
            },
        });
    }





}
