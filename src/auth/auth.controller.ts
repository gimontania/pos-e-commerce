import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto/register.dto';
import { LoginDto } from './dto/login.dto/login.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';


@Controller('auth')
export class AuthController {
    constructor(
        //permite usar authService dentro del controlador
        private readonly authService: AuthService,
    ) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        //envía los datos recibidos al servicio
        return this.authService.register(registerDto);
    }

     
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        //envía los datos recibidos al servicio
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post('perfil')
    perfil() {
        //ruta solo válida para ser utilizada con un Jwt válido
        return {
            mensaje: 'Acceso autorizado',
        };
    }

}










