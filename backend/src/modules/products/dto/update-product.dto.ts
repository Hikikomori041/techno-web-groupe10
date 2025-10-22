import { IsOptional, IsString, IsNumber, IsArray, Min, ValidateNested, IsMongoId, IsNotEmpty } from 'class-validator';
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

export class UpdateProductDto {
  @ApiProperty({
    example: 'Laptop Dell XPS 15 (Updated)',
    description: 'Product name',
    required: false,
  })
  @IsString()
  @IsOptional()
  nom?: string;

  @ApiProperty({
    example: 1199.99,
    description: 'Product price',
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  prix?: number;

  @ApiProperty({
    example: 'Updated description with new features',
    description: 'Product description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: ['https://example.com/new-image.jpg'],
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
      { key: 'Processor', value: 'Intel Core i7-12700H' },
      { key: 'RAM', value: '32GB DDR5' },
      { key: 'Storage', value: '1TB NVMe SSD' }
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
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    example: 75,
    description: 'Stock quantity',
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  quantite_en_stock?: number;
}

