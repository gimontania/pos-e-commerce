import { IsInt, IsPositive } from 'class-validator';

export class AddCartItemDto {
    //id del producto que queremos agregar
    @IsInt()
    @IsPositive()
    productId: number;

    //cantidad que queremos agregar
    @IsInt()
    @IsPositive()
    quantity: number;
}