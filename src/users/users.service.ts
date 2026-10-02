import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateCajeroDto } from './dto/create-cajero.dto/create-cajero.dto';



@Injectable()
export class UsersService {
    constructor(
        //permite usar prisma dentro del service
        private readonly prisma: PrismaService,
    ) {}

    async crearCajero(createCajeroDto: CreateCajeroDto) {
        //buscamos el rol cajero
        const rolCajero = await this.prisma.role.findUnique({
            where: {
                name: 'CAJERO',
            },
        });

        //si el rol no existe, detenemos la creación
        if (!rolCajero) {
            throw new Error('El rol CAJERO no existe');
        }

        //convertimos la contraseña en un hash seguro
        const passwordHash = await bcrypt.hash(
            createCajeroDto.password,
            10,
        );

        //creamos el usuario con el rol CAJERO
        const usuario = await this.prisma.user.create({
            data: {
                name: createCajeroDto.name,
                email: createCajeroDto.email,
                passwordHash,
                roleId: rolCajero.id,
            },
             //devolvemos el rol pero nunca la contraseña ni su hash
             include: {
                role: true,
             },
        });

        //devolvemos solamente los datos públicos del cajero
        return {
            id: usuario.id,
            name: usuario.name,
            email: usuario.email,
            role: usuario.role.name,
        };
    }
}
