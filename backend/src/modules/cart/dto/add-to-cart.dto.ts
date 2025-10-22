import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Product ID (MongoDB ObjectId)',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    example: 1,
    description: 'Quantity to add (defaults to 1)',
    minimum: 1,
    required: false,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  quantity?: number;
}

