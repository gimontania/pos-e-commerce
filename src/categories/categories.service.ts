import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto/create-category.dto';


@Injectable()
export class CategoriesService {
    constructor(
        //permite usar Prisma dentro del service
        private readonly prisma: PrismaService,
    ) {}

    async crearCategoria(createCategoryDto: CreateCategoryDto) {
        //creamos la categoría en la base de datos
        return this.prisma.category.create({
            data: {
                name: createCategoryDto.name,
            },
        });
    }

    async obtenerCategorias() {
        //obtenemos todas las categorias
        return this.prisma.category.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }
}
