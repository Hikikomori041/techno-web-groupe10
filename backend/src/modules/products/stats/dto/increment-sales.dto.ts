import { IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IncrementSalesDto {
  @ApiProperty({
    example: 1,
    description: 'Number of sales to increment (defaults to 1)',
    minimum: 1,
    required: false,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  increment?: number;
}

