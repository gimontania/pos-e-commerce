import { IsOptional, IsString } from 'class-validator';







export class CreateAddressDto {
    //calle y número
    @IsString()
    street: string;

    //ciudad
    @IsString()
    city: string;

    //provincia
    @IsString()
    province: string;

    //codigo postal
    @IsString()
    postalCode: string;

    //referencia opcional para la entrega
    @IsOptional()
    @IsString()
    reference?: string;

}
