import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../schemas/order.schema';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.PREPARATION,
    description: 'New order status',
  })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}

