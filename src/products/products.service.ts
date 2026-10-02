import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto/update-product.dto';



@Injectable()
export class ProductsService {
    constructor(
        //permite usar prisma dentro del service
        private readonly prisma: PrismaService,
    ) {}

    async crearProducto(createProductDto: CreateProductDto) {
        //creamos el producto en la base de datos
        return this.prisma.product.create({
            data: {
                name: createProductDto.name,
                description: createProductDto.description,
                purchasePrice: createProductDto.purchasePrice,
                salePrice: createProductDto.salePrice,
                stock: createProductDto.stock,
                categoryId: createProductDto.categoryId,
            },
        });
    }

    async obtenerProductos(categoryId?: number) {
        //obtenemos solo los datos publicos de los productos
        return this.prisma.product.findMany({
            where: {
                //solo mostramos productos que tienen stock
                stock: {
                    gt: 0,
                },
                //si se indica una categoría, también filtramos por ella
            ...(categoryId
                ? {
                    categoryId: categoryId,
                }
                : {}),
            },
            orderBy: {
                name: 'asc',
            },
            select: {
                id: true,
                name: true,
                description: true,
                salePrice: true,
                stock: true,
                categoryId: true,
                category: true,
            },
        });
    }

    async actualizarProducto(id: number, updateProductDto: UpdateProductDto) {
        //actualizamos el producto indicado
        return this.prisma.product.update({
            where: {
                id: id,
            },
            data: {
                ...updateProductDto,
            },
        });
    }

    async eliminarProducto(id: number) {
        //eliminamos el producto indicado
        return this.prisma.product.delete({
            where: {
                id: id,
            },
        });
    }
}

