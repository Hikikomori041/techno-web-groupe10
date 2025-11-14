import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: '65f0c2d5b8f86c4df0b2c1a1' })
  id: string;

  @ApiProperty({ example: '65f0c2d5b8f86c4df0b2c1a1', description: 'Frontend compatibility field' })
  _id: string;

  @ApiProperty({ example: 'Laptops' })
  name: string;

  @ApiProperty({ example: 'Ordinateurs portables et ultrabooks', required: false })
  description?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: String, required: false })
  createdAt?: Date;

  @ApiProperty({ type: String, required: false })
  updatedAt?: Date;
}

