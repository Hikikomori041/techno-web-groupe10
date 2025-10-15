import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProductStatsService } from './product-stats.service';
import { ProductStats } from './product-stats.schema';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from 'src/auth/enums/role.enum';

@Controller('product-stats')
export class ProductStatsController {
  constructor(private readonly service: ProductStatsService) {}

  // GET /product-stats
  @Get()
  findAll(@Query('details') details?: string) {
    const showDetails = details === 'true';
    return this.service.findAll(showDetails);
  }

  // GET /product-stats/:id_produit
  @Get(':id_produit')
  findByProduct(@Param('id_produit') id: string, @Query('details') details?: string) {
    const showDetails = details === 'true';
    return this.service.findByProduct(id, showDetails);
  }

  // POST /product-stats/:id_produit → mise à jour quantité
  @Post(':id_produit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiBody({
    schema: {
      example: {
        "quantite_en_stock": 4
      },
    },
  })
  updateQuantity(@Param('id_produit') id: string, @Body() body: { quantite_en_stock: number }) {
    return this.service.updateByProduct(id, { quantite_en_stock: body.quantite_en_stock });
  }

  // POST /product-stats/:id_produit/sell → incrémente les ventes
  @Post(':id_produit/sell')
  //todo: voir pour les accès -> l'utilisateur ne doit pas pouvoir y accéder, mais le site oui (pas un admin manuellement)
  incrementSales(
    @Param('id_produit') id: string,
    @Body() body?: { quantity?: number }
  ) {
    const value = body?.quantity ?? 1;
    return this.service.incrementSales(id, value);
  }

  // POST /product-stats/:id_produit/restock → augmente le stock
  @Post(':id_produit/restock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiBody({
    schema: {
      example: {
        "quantity": 4
      },
    },
  })
  restock(
    @Param('id_produit') id: string,
    @Body() body: { quantity: number }
  ) {
    const quantity = body?.quantity ?? 0;
    return this.service.restock(id, quantity);
  }

  // Note:
  //  Pas de route create ni de route delete
  //  La création et suppression des statistiques se fait en même temps que celles du produit lui-même (dans products.service.ts)
}
