import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { SalesService } from "./sales.service"; 
import { CreateSaleDto } from "./dto/create-sale.dto/create-sale.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";  



@Controller('sales')
export class SalesController {
    constructor(
        //permite usar salesService dentro del controller
        private readonly salesService: SalesService,
    ) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'CAJERO')
    async obtenerVentas() {
        //obtenemos el historial de ventas
        return this.salesService.obtenerVentas();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'CAJERO')
    async crearVenta(
        @Body() createSaleDto: CreateSaleDto,
        @Req() req: any,
    ) {
        //el usuario sale del jwt, no del body
        const userId = req.user.sub;


        //delegamos la lógica de la venta al service
        return this.salesService.crearVenta(createSaleDto, userId);
    }

    @Post('caja/abrir')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'CAJERO')
    async abrirCaja(
        @Body() body: { openingAmount: number },
        @Req() req: any,
    ) {
        //el usuario sale del jwt
        const userId = req.user.sub;

        //abrimos la caja con el monto inicial recibido
        return this.salesService.abrirCaja(
            userId,
            body.openingAmount,
        );
    }


}

















