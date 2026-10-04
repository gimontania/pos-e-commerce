import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateOrderDto {
    //id de la dirección que el cliente quiere usar para el pedido
    @IsInt()
    @IsPositive()
    addressId: number;

    //referencia adicional para la entrega
    @IsOptional()
    @IsString()
    deliveryReference?: string;
}