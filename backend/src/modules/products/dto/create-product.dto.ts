import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, Min, ValidateNested, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class SpecificationDto {
  @ApiProperty({ example: 'RAM', description: 'Specification key' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: '16GB DDR4', description: 'Specification value' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateProductDto {
  @ApiProperty({
    example: 'Laptop Dell XPS 15',
    description: 'Product name',
  })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({
    example: 1299.99,
    description: 'Product price',
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  prix: number;

  @ApiProperty({
    example: 'High-performance laptop with 15-inch display, Intel i7, 16GB RAM',
    description: 'Product description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    description: 'Array of product image URLs',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({
    example: [
      { key: 'Processor', value: 'Intel Core i7-11800H' },
      { key: 'RAM', value: '16GB DDR4' },
      { key: 'Storage', value: '512GB SSD' },
      { key: 'Display', value: '15.6" FHD' },
      { key: 'Weight', value: '1.8 kg' }
    ],
    description: 'Product specifications as array of key-value pairs',
    type: [SpecificationDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecificationDto)
  @IsOptional()
  specifications?: Array<{ key: string; value: string }>;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Category ID (MongoDB ObjectId)',
  })
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    example: 50,
    description: 'Initial stock quantity',
    minimum: 0,
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  quantite_en_stock?: number;
}

