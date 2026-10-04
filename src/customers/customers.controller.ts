import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateAddressDto } from './dto/create-address.dto/create-address.dto';
 



@Controller('customers')
export class CustomersController {
    constructor(
        //permite usar CustomerService dentro del controller
        private readonly customerService: CustomersService,
    ) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CLIENTE')
    @Get('perfil')
    obtenerPerfil(@Req() req: Request) {
        //obtenemos el id del usuario desde el jwt
        const userId = (req.user as any).sub;

        //buscamos el cliente asociado a ese usuario
        return this.customerService.obtenerPerfil(userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CLIENTE')
    @Post('direcciones')
    async crearDireccion(
        @Req() req: Request,
        @Body() createAddressDto: CreateAddressDto,
    ) {
        //obtenemos el id del usuario desde el jwt
        const userId = (req.user as any).sub;

        //creamos la direccion del cliente
        return this.customerService.crearDireccion(userId, createAddressDto);
    }

}
