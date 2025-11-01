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

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @CreateOrderDocs()
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user.userId;
    return this.ordersService.createOrder(userId, createOrderDto);
  }

  @Get()
  @GetUserOrdersDocs()
  async getUserOrders(@Request() req) {
    const userId = req.user.userId;
    return this.ordersService.getUserOrders(userId);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @GetAllOrdersDocs()
  async getAllOrders(@Request() req) {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    return this.ordersService.getAllOrders(userId, userRoles);
  }

  @Get(':id')
  @GetOrderByIdDocs()
  async getOrderById(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    return this.ordersService.getOrderById(id, userId, userRoles);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @UpdateOrderStatusDocs()
  async updateOrderStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    return this.ordersService.updateOrderStatus(id, updateOrderStatusDto.status, userId, userRoles);
  }

  @Put(':id/payment')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @UpdatePaymentStatusDocs()
  async updatePaymentStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
  ) {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    return this.ordersService.updatePaymentStatus(id, updatePaymentStatusDto.paymentStatus, userId, userRoles);
  }

  @Delete(':id')
  @CancelOrderDocs()
  async cancelOrder(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    return this.ordersService.cancelOrder(id, userId, userRoles);
  }
}

