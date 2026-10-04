import { IsInt, IsPositive } from 'class-validator';

export class UpdateCartItemDto {
    //nueva cantidad que queremos tener del producto
    @IsInt()
    @IsPositive()
    quantity: number;
}