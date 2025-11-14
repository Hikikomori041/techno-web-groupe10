import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import {
  CreateOrderDocs,
  GetUserOrdersDocs,
  GetOrderByIdDocs,
  GetAllOrdersDocs,
  UpdateOrderStatusDocs,
  UpdatePaymentStatusDocs,
  CancelOrderDocs,
} from './orders.swagger';
import { OrderMapper } from './mappers/order.mapper';
import { OrderResponseDto } from './dto/order-response.dto';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @CreateOrderDocs()
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const userId = req.user.userId;
    const input = OrderMapper.fromCreateDto(createOrderDto);
    const order = await this.ordersService.createOrder(userId, input);
    if (!order) {
      throw new NotFoundException('Failed to create order');
    }
    return OrderMapper.toResponse(order);
  }

  @Get()
  @GetUserOrdersDocs()
  async getUserOrders(@Request() req): Promise<OrderResponseDto[]> {
    const userId = req.user.userId;
    const orders = await this.ordersService.getUserOrders(userId);
    return OrderMapper.toResponseList(orders);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @GetAllOrdersDocs()
  async getAllOrders(@Request() req): Promise<OrderResponseDto[]> {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    const orders = await this.ordersService.getAllOrders(userId, userRoles);
    return OrderMapper.toResponseList(orders);
  }

  @Get(':id')
  @GetOrderByIdDocs()
  async getOrderById(@Request() req, @Param('id') id: string): Promise<OrderResponseDto> {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    const order = await this.ordersService.getOrderById(id, userId, userRoles);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return OrderMapper.toResponse(order);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @UpdateOrderStatusDocs()
  async updateOrderStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    const order = await this.ordersService.updateOrderStatus(
      id,
      updateOrderStatusDto.status,
      userId,
      userRoles,
    );
    return OrderMapper.toResponse(order);
  }

  @Put(':id/payment')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @UpdatePaymentStatusDocs()
  async updatePaymentStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
  ): Promise<OrderResponseDto> {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    const order = await this.ordersService.updatePaymentStatus(
      id,
      updatePaymentStatusDto.paymentStatus,
      userId,
      userRoles,
    );
    return OrderMapper.toResponse(order);
  }

  @Delete(':id')
  @CancelOrderDocs()
  async cancelOrder(@Request() req, @Param('id') id: string): Promise<OrderResponseDto> {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    const order = await this.ordersService.cancelOrder(id, userId, userRoles);
    return OrderMapper.toResponse(order);
  }
}

