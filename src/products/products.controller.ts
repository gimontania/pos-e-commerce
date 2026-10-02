import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
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

    //ADMIN y CAJERO pueden crear productos
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'CAJERO')
    @Post()
    async crearProducto(@Body() createProductDto: CreateProductDto) {
        //enviamos los datos al service
        return this.productsService.crearProducto(createProductDto)
    }
    @Get()
    async obtenerProductos(@Query('category') categoryId?: string) {
        //obtenemos los productos desde el service, opcionalmente filtrados por categoría
        return this.productsService.obtenerProductos(
            categoryId ? Number(categoryId) : undefined,
        );
    }
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'CAJERO')
    @Patch(':id')
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

    //ADMIN y CAJERO pueden eliminar productos
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'CAJERO')
    @Delete(':id')
    async eliminarProducto(@Param('id') id: string) {
            //enviamos el id al service
            return this.productsService.eliminarProducto(Number(id));
    }
}
