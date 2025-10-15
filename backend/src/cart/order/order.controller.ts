import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Panier - commande')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Post('/create')
  @ApiBody({
    schema: { example: { id_utilisateur: '6520f...' } },
  })
  create(@Body() body: { id_utilisateur: string }) {
    return this.service.createOrder(body.id_utilisateur);
  }

  @Get('/user/:id')
  getOrders(@Param('id') id: string) {
    return this.service.getOrdersByUser(id);
  }

  @Post('/status')
  @ApiBody({
    schema: { example: { id_order: '6520f...', statut: 'expédiée' } },
  })
  updateStatus(@Body() body: { id_order: string; statut: string }) {
    return this.service.updateStatus(body.id_order, body.statut);
  }
}
