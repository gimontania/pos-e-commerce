import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';



@Injectable()
export class CartService {
    constructor(
        //permite usar prisma dentro del service
        private readonly prisma: PrismaService,
    ) {}

    async obtenerCarrito(userId: number) {
        //buscamos el cliente asociado al usuario autenticado
        const cliente = await this.prisma.customer.findUnique({
            where: {
                userId: userId,
            },
        });

        //si no existe el cliente, detenemos la petición
        if (!cliente) {
            throw new NotFoundException('El cliente no existe');
        }

        //buscamos el carrito del cliente
        return this.prisma.cart.findUnique({
            where: {
                customerId: cliente.id,
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                salePrice: true,
                                stock: true,
                            },                            
                        },
                    },
                },
            },
        });
    }

    async agregarProducto(userId: number, productId: number, quantity: number) {
        //buscamos el cliente asociado al usuario autenticado
        const cliente = await this.prisma.customer.findUnique({
            where: {
                userId: userId,
            },
        });

        //si no existe el cliente, detenemos la petición
        if (!cliente) {
            throw new NotFoundException('El cliente no existe');
        }

        //buscamos el producto que queremos agregar
        const producto = await this.prisma.product.findUnique({
            where: {
                id: productId,
            },
        });

        //si el producto no existe, detenemos la pertición
        if (!producto) {
            throw new NotFoundException('El producto no existe');
        }

        //verificamos que haya stock sufuciente
        if (producto.stock < quantity) {
            throw new NotFoundException('No hay stock suficiente');
        }

        //buscamos el carrito del cliente
        let carrito = await this.prisma.cart.findUnique({
            where: {
                customerId: cliente.id,
            },
        });

        //si el cliente todavía no tiene carrrito, lo creamos
        if (!carrito) {
            carrito = await this.prisma.cart.create({
                data: {
                    customerId: cliente.id,
                },
            });
        }

        //buscamos si el producto ya está dentro del carrito
        const itemExistente = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: carrito.id,
                    productId: productId,
                },
            },
        });

        //si ya existe, aumentamos su cantidad
        if (itemExistente) {
            const nuevaCantidad = itemExistente.quantity + quantity;

            //verificamos nuevamente el stock total solicitado
            if (nuevaCantidad > producto.stock) {
                throw new NotFoundException('No hay stock suficiente');
            }

            return this.prisma.cartItem.update({
                where: {
                    id: itemExistente.id,
                },
                data: {
                    quantity: nuevaCantidad,
                },
            });
        }

        //si no existe, agregamos el carrito
        return this.prisma.cartItem.create({
            data: {
                cartId: carrito.id,
                productId: productId,
                quantity: quantity,
            },
        });
        
    }

    async modificarCantidad(
        userId: number,
        productId: number,
        quantity: number,
    ) {
       //buscamos el cliente asociado al usuario autenticado
       const cliente = await  this.prisma.customer.findUnique({
        where: {
            userId: userId,
        },
       });

       //si no existe el cliente, detenemos la petición
       if (!cliente) {
        throw new NotFoundException('El cliente no existe');
       }

       //buscamos el carrito del cliente  
       const carrito = await this.prisma.cart.findUnique({
        where: {
            customerId: cliente.id,
        },
    });

       //si no existe el carrito, detenemos la petición
       if (!carrito) {
        throw new NotFoundException('El carrito no existe');
       }

       //buscamos el producto dentro del carrito
       const item = await this.prisma.cartItem.findUnique({
        where: {
            cartId_productId: {
                cartId: carrito.id,
                productId: productId,
            },
        },
       });

       //si el producto no está en el carrito, detenemos la petición
       if (!item) {
        throw new NotFoundException('El producto no está en el carrito');
       }

       //buscamos el producto para conocer su stock actual
       const producto = await this.prisma.product.findUnique({
        where: {
            id: productId,
        },
       });

       //si el producto no existe, detenemos la petición
       if (!producto) {
        throw new NotFoundException('El producto no existe');
       }

       //verificamos que la nueva cantidad no supere el stock
       if (quantity > producto.stock) {
        throw new NotFoundException('No hay stock suficiente');
       }

       //actualizamos la cantidad del producto en el carrito
       return this.prisma.cartItem.update({
        where: {
            id: item.id,
        },
        data: {
            quantity: quantity,
        },
       });
    }

    async eliminarProducto(userId: number, productId: number){
        //buscamos el cliente asociado al usuario autenticado
        const cliente =  await this.prisma.customer.findUnique({
            where: {
                userId: userId,
            },
        });

        //si no existe el cliente, detenemos la petición
        if (!cliente) {
            throw new NotFoundException('El cliente no existe');
        }

        //buscamos el carrito del cliente
        const carrito = await this.prisma.cart.findUnique({
            where: {
                customerId: cliente.id,
            },
        });

        //si no existe el carrito, detenemos la petición
        if (!carrito) {
            throw new NotFoundException('El carrito no existe');
        }

        //buscamos el producto dentro del carrito
        const item = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: carrito.id, 
                    productId: productId,                   
                },
            },
        });

        //si el producto no está en el carrito, detenemos la petición
        if (!item) {
            throw new NotFoundException('El producto no está en el carrito');
        }

        //eliminamos el producto del carrito
        return this.prisma.cartItem.delete({
            where: {
                id: item.id,
            },
        });
    }
}
