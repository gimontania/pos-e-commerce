import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Consultar perfil del cliente',
        description: 'Devuelve el perfil del cliente autenticado',
    })
    @ApiResponse({
        status: 200,
        description: 'Perfil obtenido correctamente',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene rol cliente',
    })
    obtenerPerfil(@Req() req: Request) {
        //obtenemos el id del usuario desde el JWT
        const userId = (req.user as any).sub;

        //buscamos el cliente asociado a ese usuario
        return this.customerService.obtenerPerfil(userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CLIENTE')
    @Post('direcciones')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Agregar una dirección',
        description: 'Permite al cliente autenticado registrar una nueva dirección',
    })
    @ApiResponse({
        status: 201,
        description: 'Dirección creada correctamente',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene rol cliente',
    })
    async crearDireccion(
        @Req() req: Request,
        @Body() createAddressDto: CreateAddressDto,
    ) {
        //obtenemos el id del usuario desde el JWT
        const userId = (req.user as any).sub;

        //creamos la dirección del cliente
        return this.customerService.crearDireccion(userId, createAddressDto);
    }
}

