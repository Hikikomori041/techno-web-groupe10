import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@ApiTags('Panier')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('cart')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get(':id_utilisateur')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  getCart(@Param('id_utilisateur') id: string) {
    return this.service.getCartByUser(id);
  }

  @Post('add')
  @ApiBody({
    schema: {
      example: {
        id_produit: '68ef99e40cf6bde5d902ffe7',
        quantite: 2,
      },
    },
  })
  add(@User('userId') id_utilisateur: string, @Body() body: { id_produit: string; quantite?: number }) {
    return this.service.addToCart(id_utilisateur, body.id_produit, body.quantite);
  }

  @Delete('remove')
  @ApiBody({
    schema: {
      example: { id_utilisateur: '6520f...', id_produit: '6521a...' },
    },
  })
  remove(@Body() body: { id_utilisateur: string; id_produit: string }) {
    return this.service.removeFromCart(body.id_utilisateur, body.id_produit);
  }

  @Delete('clear/:id_utilisateur')
  clear(@Param('id_utilisateur') id: string) {
    return this.service.clearCart(id);
  }
}