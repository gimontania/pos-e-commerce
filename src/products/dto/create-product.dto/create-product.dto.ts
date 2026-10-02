export class CreateProductDto {
    //datos básicos del producto
    name: string;
    description?: string;

    //precios e inventario
    purchasePrice: number;
    salePrice: number;
    stock: number;

    //categoría a la que pertenece
    categoryId: number;
}
