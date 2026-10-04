import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';


@Controller('orders')
export class OrdersController {
    constructor(
        //permite usar orderService dentro del controller
        private readonly ordersService: OrdersService,
    ) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles ('CLIENTE')
    @Post()
    crearPedido(
        @Req() req: Request,
        @Body() createOrderDto: CreateOrderDto,
    ) {
        //obtenemos el id del ususario desde el jwt
        const userId = (req.user as any).sub;

        //creamos el pedido usando el carrito del cliente
        return this.ordersService.crearPedido(
            createOrderDto,
            userId,
        );
    }

    //admin y cajero pueden consultar la logistica
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles ('ADMIN', 'CAJERO')
    @Get()
    obtenerPedidos() {
        //obtenemos todos los pedidos para la logística
        return this.ordersService.obtenerPedidos();
    }


    //actualizamos el estado de un pedido
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles ('ADMIN', 'CAJERO')
    @Patch(':id/status')
    actualizarEstado(
        @Param('id') id:string,
        @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    ) {
        //convertimos el id del texto a número
        return this.ordersService.actualizarEstado(
            Number(id),
            updateOrderStatusDto.status,
        );
    }






}
