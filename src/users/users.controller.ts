import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateCajeroDto } from './dto/create-cajero.dto/create-cajero.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';


@Controller('users')
export class UsersController {
    constructor(
        //permite usar UsersService dentro del controller
        private readonly usersService: UsersService,
    ) {}

        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles('ADMIN')
        @Post('cajero')
        async crearCajero(@Body() createCajeroDto: CreateCajeroDto) {
            //envía los datos recibidos al service
            return this.usersService.crearCajero(createCajeroDto);
        }    
}
