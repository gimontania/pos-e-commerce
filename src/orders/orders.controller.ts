import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';



@Controller('orders')
export class OrdersController {
    constructor(
        //permite usar orderService dentro del controller
        private readonly ordersService: OrdersService,
    ) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CLIENTE')
    @Post()
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Crear un pedido',
        description:
            'Permite al cliente autenticado crear un pedido utilizando los productos de su carrito',
    })
    @ApiResponse({
        status: 201,
        description: 'Pedido creado correctamente',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene rol cliente',
    })
    async crearPedido(
        @Req() req: Request,
        @Body() createOrderDto: CreateOrderDto,
    ) {
        //obtenemos el id del usuario desde el JWT
        const userId = (req.user as any).sub;

        //creamos el pedido usando el carrito del cliente
        return this.ordersService.crearPedido(
            createOrderDto,
            userId,
        );
    }

    // ADMIN y CAJERO pueden consultar la logística
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'CAJERO')
    @Get()
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Consultar pedidos',
        description:
            'Permite a admin o cajero consultar los pedidos para gestionar la logística',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de pedidos obtenida correctamente',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene permisos suficientes',
    })
    obtenerPedidos() {
        //obtenemos todos los pedidos para la logística
        return this.ordersService.obtenerPedidos();
    }

    //actualizamos el estado de un pedido
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'CAJERO')
    @Patch(':id/status')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Actualizar estado de un pedido',
        description:
            'Permite a admin o cajero cambiar el estado de un pedido',
    })
    @ApiResponse({
        status: 200,
        description: 'Estado del pedido actualizado correctamente',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene permisos suficientes',
    })
    async actualizarEstado(
        @Param('id') id: string,
        @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    ) {
        //convertimos el id de texto a número
        return this.ordersService.actualizarEstado(
            Number(id),
            updateOrderStatusDto.status,
        );
    }
}
