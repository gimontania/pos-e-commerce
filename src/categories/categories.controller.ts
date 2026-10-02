import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';


@Controller('categories')
export class CategoriesController {
    constructor(
        //permite usar categoriesService dentro del controller
        private readonly categoriesService: CategoriesService,
    ) {}

    //solo ADMIN puede crear categorías
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post()
    async crearCategoria(@Body() createCategoryDto: CreateCategoryDto) {
        //enviamos los datos al service
        return this.categoriesService.crearCategoria(createCategoryDto);
    }
    @Get()
    async obtenerCategorias() {
        //obtenemos las categorias desde el service
        return this.categoriesService.obtenerCategorias();
    }
}
