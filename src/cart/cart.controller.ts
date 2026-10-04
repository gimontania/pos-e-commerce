import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';


@Controller('cart')
export class CartController {
    constructor(
        //permite usar CartService dentro del controller
        private readonly cartService: CartService,
    ) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CLIENTE')
    @Get()
    obtenerCarrito(@Req() req: Request) {
        //obtenemos el id del usuario desde el jwt
        const userId = (req.user as any).sub;

        //buscamos el carrito del cliente
        return this.cartService.obtenerCarrito(userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CLIENTE')
    @Post('items')
    agregarProducto(
        @Req() req: Request,
        @Body() addCartItemDto: AddCartItemDto,
    ) {
        //obtenemos el id del usuario desde el jwt
        const userId = (req.user as any).sub;

        //agregamos el proudcto al carrito
        return this.cartService.agregarProducto(
            userId,
            addCartItemDto.productId,
            addCartItemDto.quantity,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CLIENTE')
    @Patch('items/:productId')
    modificarCantidad(
        @Req() req: Request,
        @Param('productId') productId: string,
        @Body() updateCartItemDto: UpdateCartItemDto,
    ) {
        //obtenemos el id del usuario desde el jwt
        const userId = (req.user as any).sub;

        //convertimos el id del producto de texto a número
        const idProducto = Number(productId);

        //modificamos la cantidad del producto  
        return this.cartService.modificarCantidad(
            userId,
            idProducto,
            updateCartItemDto.quantity,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CLIENTE')
    @Delete('items/:productId')
    eliminarProducto(
        @Req() req: Request,
        @Param('productId') productId: string,
    ) {
        //obtenemos el id del usuario desde el jwt
        const userId = (req.user as any).sub;

        //convertimos el id del producto de texto a número
        const idProducto = Number(productId);

        //eliminamos el producto del carrito
        return this.cartService.eliminarProducto(
            userId,
            idProducto,
        );
    }




}
