import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateQuantityDto {
  @ApiProperty({
    example: 50,
    description: 'New stock quantity',
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  quantite_en_stock: number;
}

