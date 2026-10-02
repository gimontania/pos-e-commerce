import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto/login.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(
        //permite usar prisma dentro de authService
        private readonly prisma: PrismaService,

        //permite generar tokens JWT
        private readonly jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto) {
        //buscamos el rol "cliente" que creamos oon el seed
        const rolCliente = await this.prisma.role.findUnique({
            where: {
                name: 'CLIENTE',
            },
        }); 

        //si por alguna razón no existe, detenemos el registro
        if (!rolCliente) {
            throw new Error('El rol CLIENTE no existe');
        }

        //convertimos la contraseña en un hash seguro
        const passwordHash = await bcrypt.hash(registerDto.password, 10);

        //creamos el usuario y su cliente asociado
        const usuario = await this.prisma.user.create({
            data: {
                name: registerDto.name,
                email: registerDto.email,
                passwordHash,
                roleId: rolCliente.id,

                customer:{
                    create: {
                        phone: registerDto.phone,
                    },
                },
            },

            //devolvemos también el rol
            include: {
                role: true,
                customer: true,
            },
        });

        //nunca devolvemos la contraseña ni su hash
        return {
            id: usuario.id,
            name: usuario.name,
            email: usuario.email,
            role: usuario.role.name,
            customer: usuario.customer,
        };
    }

    async login(loginDto: LoginDto) {
        //buscamos al usuario por su email
        const usuario = await this.prisma.user.findUnique({
            where: {
                email: loginDto.email,
            },
            include: {
                role: true,
            },
        });

        //si no existe, rechazamos el login
        if (!usuario) {
            throw new Error('Email o contraseña incorrectos');
        }

        //comparamos la contraseña recibida con el hash guardado
        const passwordCorrecta = await bcrypt.compare(
            loginDto.password,
            usuario.passwordHash,
        );

        //si no coincide rechazamos el login
        if (!passwordCorrecta) {
            throw new Error('Email o contraseña incorrectos');
        }

        //datos que guardaremos dentro del jwt
        const payload = {
            sub: usuario.id,
            email: usuario.email,
            role: usuario.role.name,
        };

        //generamos el token jwt
        const token = await this.jwtService.signAsync(payload);

        //devolvemos el token y los datos básicos del usuario
        return {
            access_token: token,
            user: {
            id: usuario.id,
            name: usuario.name,
            email: usuario.email, 
            role: usuario.role.name,
        },
    };
    }
}
