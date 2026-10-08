import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';


@Controller('cart')
export class CartController {
    constructor(
        //permite usar CartService dentro del controller
        private readonly cartService: CartService,
    ) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CLIENTE')
    @Get()
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Consultar carrito',
        description: 'Devuelve el carrito del cliente autenticado',
    })
    @ApiResponse({
        status: 200,
        description: 'Carrito obtenido correctamente',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene rol cliente',
    })
    obtenerCarrito(@Req() req: Request) {
        //obtenemos el id del usuario desde el JWT
        const userId = (req.user as any).sub;

        //buscamos el carrito del cliente
        return this.cartService.obtenerCarrito(userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CLIENTE')
    @Post('items')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Agregar producto al carrito',
        description:
            'Permite al cliente autenticado agregar un producto y una cantidad al carrito',
    })
    @ApiResponse({
        status: 201,
        description: 'Producto agregado correctamente al carrito',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene rol cliente',
    })
    async agregarProducto(
        @Req() req: Request,
        @Body() addCartItemDto: AddCartItemDto,
    ) {
        //obtenemos el id del usuario desde el JWT
        const userId = (req.user as any).sub;

        //agregamos el producto al carrito
        return this.cartService.agregarProducto(
            userId,
            addCartItemDto.productId,
            addCartItemDto.quantity,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CLIENTE')
    @Patch('items/:productId')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Modificar cantidad del carrito',
        description: 'Permite modificar la cantidad de un producto del carrito',
    })
    @ApiResponse({
        status: 200,
        description: 'Cantidad modificada correctamente',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene rol cliente',
    })
    async modificarCantidad(
        @Req() req: Request,
        @Param('productId') productId: string,
        @Body() updateCartItemDto: UpdateCartItemDto,
    ) {
        //obtenemos el id del usuario desde el JWT
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
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Eliminar producto del carrito',
        description: 'Permite eliminar un producto del carrito del cliente',
    })
    @ApiResponse({
        status: 200,
        description: 'Producto eliminado correctamente del carrito',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene rol cliente',
    })
    async eliminarProducto(
        @Req() req: Request,
        @Param('productId') productId: string,
    ) {
        //obtenemos el id del usuario desde el JWT
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
