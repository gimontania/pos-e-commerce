import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateCajeroDto } from './dto/create-cajero.dto/create-cajero.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
    constructor(
        // permite usar UsersService dentro del controller
        private readonly usersService: UsersService,
    ) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post('cajero')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Crear un cajero',
        description: 'Permite al ADMIN crear un nuevo usuario con rol CAJERO.',
    })
    @ApiResponse({
        status: 201,
        description: 'Cajero creado correctamente.',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido.',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene rol ADMIN.',
    })
    async crearCajero(@Body() createCajeroDto: CreateCajeroDto) {
        // envía los datos recibidos al service
        return this.usersService.crearCajero(createCajeroDto);
    }
}
