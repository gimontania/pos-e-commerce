import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto/update-product.dto';

@Controller('products')
export class ProductsController {
    constructor(
        //permite usar productsService dentro del controller
        private readonly productsService: ProductsService,
    ) {}

    //admin y cajero pueden crear productos
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'CAJERO')
    @Post()
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Crear un producto',
        description: 'Permite a admin o cajero registrar un nuevo producto.',
    })
    @ApiResponse({
        status: 201,
        description: 'Producto creado correctamente.',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido.',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene permisos suficientes.',
    })
    async crearProducto(@Body() createProductDto: CreateProductDto) {
        //enviamos los datos al service
        return this.productsService.crearProducto(createProductDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Obtener productos',
        description:
            'Devuelve el catálogo de productos. Permite filtrar opcionalmente por categoría.',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de productos obtenida correctamente.',
    })
    async obtenerProductos(@Query('category') categoryId?: string) {
        //obtenemos los productos desde el service, opcionalmente filtrados por categoría
        return this.productsService.obtenerProductos(
            categoryId ? Number(categoryId) : undefined,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'CAJERO')
    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Actualizar un producto',
        description: 'Permite a admin o cajero modificar un producto existente.',
    })
    @ApiResponse({
        status: 200,
        description: 'Producto actualizado correctamente.',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido.',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene permisos suficientes.',
    })
    async actualizarProducto(
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        //enviamos el id y los datos al service
        return this.productsService.actualizarProducto(
            Number(id),
            updateProductDto,
        );
    }

    //admin y cajero pueden eliminar productos
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'CAJERO')
    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Eliminar un producto',
        description: 'Permite a admin o cajero eliminar un producto.',
    })
    @ApiResponse({
        status: 200,
        description: 'Producto eliminado correctamente.',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido.',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene permisos suficientes.',
    })
    async eliminarProducto(@Param('id') id: string) {
        //enviamos el id al service
        return this.productsService.eliminarProducto(Number(id));
    }
}
