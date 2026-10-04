import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../../generated/prisma/enums';




export class UpdateOrderStatusDto {
    //nuevo estado que tendrá el pedido
    @IsEnum(OrderStatus)
    status: OrderStatus;

}


























