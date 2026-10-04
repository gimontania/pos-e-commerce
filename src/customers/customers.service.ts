import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto/create-address.dto';



@Injectable()
export class CustomersService {
    constructor(
        //permite usar prisma dentro del service
        private readonly prisma: PrismaService,
    ) {}

    async obtenerPerfil(userId: number) {
        //buscamos el cliente asociado al usuario autenticado
        const cliente = await this.prisma.customer.findUnique({
            where: {
                userId: userId,
            },
            include: {
                user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            addresses: true,
        },
        });

        //si no existe el cliente, detenemos la petición
        if (!cliente) {
            throw new NotFoundException('El cliente no existe');
        }

        return cliente;
    }
    async crearDireccion(userId: number, createAddressDto: CreateAddressDto) {
        //buscamos al cliente mediante el usuario autenticado
        const cliente = await this.prisma.customer.findUnique({
            where: {
                userId: userId,
            },
        });

        //si no existe el cliente, detenemos la petición
        if (!cliente) {
            throw new NotFoundException('El cliente no existe');
        }

        //creamos la dirección asociada al cliente
        return this.prisma.address.create({
            data: {
                street: createAddressDto.street,
                city: createAddressDto.city,
                province: createAddressDto.province,
                postalCode: createAddressDto.postalCode,
                reference: createAddressDto.reference,
                customerId: cliente.id,
            },
        });

    }


}
