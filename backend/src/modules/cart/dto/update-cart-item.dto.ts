import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({
    example: 2,
    description: 'New quantity (set to 0 to remove item)',
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  quantity: number;
}

