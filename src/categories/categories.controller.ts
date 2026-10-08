import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
    constructor(
        // permite usar categoriesService dentro del controller
        private readonly categoriesService: CategoriesService,
    ) {}

    // solo ADMIN puede crear categorías
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post()
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Crear una categoría',
        description: 'Permite al ADMIN crear una nueva categoría de productos.',
    })
    @ApiResponse({
        status: 201,
        description: 'Categoría creada correctamente.',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido.',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene rol ADMIN.',
    })
    async crearCategoria(@Body() createCategoryDto: CreateCategoryDto) {
        // enviamos los datos al service
        return this.categoriesService.crearCategoria(createCategoryDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Obtener categorías',
        description: 'Devuelve todas las categorías disponibles.',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de categorías obtenida correctamente.',
    })
    async obtenerCategorias() {
        // obtenemos las categorias desde el service
        return this.categoriesService.obtenerCategorias();
    }
}
