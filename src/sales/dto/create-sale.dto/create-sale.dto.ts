//producto incluido dentro de la venta
export class SaleItemDto {
    //id del producto que se quiere vender
    productId: number;

    //cantidad de unidades
    quantity: number;
}

//datos necesarios para registrar una venta
export class CreateSaleDto {
    //caja donde se realiza la venta
    cashRegisterId: number;

    //forma de pago elegida
    paymentMethod: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA_QR';

    //productos que forman parte de la venta
    items: SaleItemDto[];
}