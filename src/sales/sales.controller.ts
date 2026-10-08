import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { SalesService } from "./sales.service"; 
import { CreateSaleDto } from "./dto/create-sale.dto/create-sale.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";  
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";




@ApiBearerAuth()
@Controller('sales')
export class SalesController {
    constructor(
        //permite usar salesService dentro del controller
        private readonly salesService: SalesService,
    ) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'CAJERO')
    @ApiOperation({
        summary: 'Consultar ventas',
        description:
            'Permite a admin o cajero consultar el historial de ventas',
    })
    @ApiResponse({
        status: 200,
        description: 'Historial de ventas obtenido correctamente',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene permisos suficientes',
    })
    async obtenerVentas() {
        //obtenemos el historial de ventas
        return this.salesService.obtenerVentas();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'CAJERO')
    @ApiOperation({
        summary: 'Registrar una venta POS',
        description:
            'Registra una venta desde el punto de venta, valida stock y descuenta las unidades vendidas',
    })
    @ApiResponse({
        status: 201,
        description: 'Venta registrada correctamente',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene permisos suficientes',
    })
    async crearVenta(
        @Body() createSaleDto: CreateSaleDto,
        @Req() req: any,
    ) {
        //el usuario sale del JWT, no del body
        const userId = req.user.sub;

        //delegamos la lógica de la venta al service
        return this.salesService.crearVenta(createSaleDto, userId);
    }

    @Post('caja/abrir')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'CAJERO')
    @ApiOperation({
        summary: 'Abrir caja',
        description:
            'Abre la caja del turno indicando el monto inicial disponible',
    })
    @ApiResponse({
        status: 201,
        description: 'Caja abierta correctamente',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene permisos suficientes',
    })
    @ApiBody({
    schema: {
        type: 'object',
        properties: {
            openingAmount: {
                type: 'number',
                example: 10000,
                description: 'Monto inicial disponible en la caja',
            },
        },
        required: ['openingAmount'],
    },
    })
    async abrirCaja(

        @Body() body: { openingAmount: number },
        @Req() req: any,
    ) {
        //el usuario sale del JWT
        const userId = req.user.sub;

        //abrimos la caja con el monto inicial recibido
        return this.salesService.abrirCaja(
            userId,
            body.openingAmount,
        );
    }

    @Post('caja/cerrar')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'CAJERO')
    @ApiOperation({
        summary: 'Cerrar caja',
        description:
            'Cierra la caja y concilia el efectivo contado contra las ventas en efectivo del turno',
    })
    @ApiResponse({
        status: 201,
        description: 'Caja cerrada y conciliada correctamente',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado o JWT inválido',
    })
    @ApiResponse({
        status: 403,
        description: 'El usuario no tiene permisos suficientes',
    })
    @ApiBody({
    schema: {
        type: 'object',
        properties: {
            closingAmount: {
                type: 'number',
                example: 10000,
                description: 'Monto de efectivo contado al cerrar la caja',
            },
        },
        required: ['closingAmount'],
    },
    })
    async cerrarCaja(

        @Body() body: { closingAmount: number },
        @Req() req: any,
    ) {
        //el usuario sale del JWT
        const userId = req.user.sub;

        //cerramos la caja y conciliamos el efectivo
        return this.salesService.cerrarCaja(
            userId,
            body.closingAmount,
        );
    }
}






