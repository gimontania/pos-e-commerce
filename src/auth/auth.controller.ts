import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto/register.dto';
import { LoginDto } from './dto/login.dto/login.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';


@Controller('auth')
export class AuthController {
    constructor(
        // permite usar authService dentro del controlador
        private readonly authService: AuthService,
    ) {}

    @Post('register')
    @ApiOperation({
        summary: 'Registrar un cliente',
        description: 'Crea una nueva cuenta de cliente en el sistema.',
    })
    @ApiResponse({
        status: 201,
        description: 'Cliente registrado correctamente.',
    })
    @ApiResponse({
        status: 400,
        description: 'Los datos enviados no son válidos.',
    })
    async register(@Body() registerDto: RegisterDto) {
        // envía los datos recibidos al servicio
        return this.authService.register(registerDto);
    }

    @Post('login')
    @ApiOperation({
        summary: 'Iniciar sesión',
        description: 'Autentica al usuario y devuelve un JWT.',
    })
    @ApiResponse({
        status: 201,
        description: 'Inicio de sesión exitoso. Devuelve el access_token.',
    })
    @ApiResponse({
        status: 401,
        description: 'Email o contraseña incorrectos.',
    })
    async login(@Body() loginDto: LoginDto) {
        // envía los datos recibidos al servicio
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post('perfil')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Consultar perfil autorizado',
        description: 'Endpoint protegido. Requiere JWT válido y rol ADMIN.',
    })
    @ApiResponse({
        status: 200,
        description: 'Acceso autorizado.',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido.',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene permisos suficientes.',
    })
    perfil() {
        // ruta válida solo con un JWT válido y rol ADMIN
        return {
            mensaje: 'Acceso autorizado',
        };
    }
}
