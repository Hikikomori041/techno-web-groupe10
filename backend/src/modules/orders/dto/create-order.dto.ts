import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ShippingAddressDto {
  @ApiProperty({
    example: '123 Rue de la Paix',
    description: 'Street address',
  })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({
    example: 'Paris',
    description: 'City',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    example: '75001',
    description: 'Postal code',
  })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({
    example: 'France',
    description: 'Country',
  })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateOrderDto {
  @ApiProperty({
    type: ShippingAddressDto,
    description: 'Shipping address for the order',
  })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;
}

