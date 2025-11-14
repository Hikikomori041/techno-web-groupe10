import { ApiProperty } from '@nestjs/swagger';
import { ProductSpecificationInput } from '../types/product.types';

export class ProductResponseDto {
  @ApiProperty({ example: '65f0c2d5b8f86c4df0b2c1a1' })
  id: string;

  @ApiProperty({ example: '65f0c2d5b8f86c4df0b2c1a1', description: 'Frontend compatibility field' })
  _id: string;

  @ApiProperty({ example: 'MacBook Pro 14' })
  nom: string;

  @ApiProperty({ example: 2499 })
  prix: number;

  @ApiProperty({ example: 'Laptop haut de gamme', required: false })
  description?: string;

  @ApiProperty({ type: [String], required: false })
  images?: string[];

  @ApiProperty({ type: Array, required: false })
  specifications: ProductSpecificationInput[];

  @ApiProperty({ example: '65f0c2d5b8f86c4df0b2c1b2' })
  categoryId: string;

  @ApiProperty({ example: '65f0c2d5b8f86c4df0b2c1c3', required: false })
  moderatorId?: string;

  @ApiProperty({ example: 42 })
  quantite_en_stock: number;

  @ApiProperty({ example: '2024-06-15T10:00:00.000Z' })
  date_de_creation: Date;

  @ApiProperty({ example: '65f0c2d5b8f86c4df0b2c1b2', required: false })
  id_categorie?: string;
}

