export class UpdateProductDto {
    //datos que se pueden actualizar
    name?: string;
    description?: string;
    purchasePrice?: number;
    salePrice?: number;
    stock?: number;
    categoryId?: number;
}
