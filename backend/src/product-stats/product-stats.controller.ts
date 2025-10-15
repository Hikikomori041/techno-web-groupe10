import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProductStatsService } from './product-stats.service';
import { ProductStats } from './product-stats.schema';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from 'src/auth/enums/role.enum';

import {
  GetAllProductStatsDocs,
  GetProductStatsByIdDocs,
  UpdateStockDocs,
  SellProductDocs,
  RestockProductDocs,
} from './product-stats.swagger';

@ApiTags('Produits')
@Controller('product-stats')
export class ProductStatsController {
  constructor(private readonly service: ProductStatsService) {}

  // GET /product-stats
  @Get()
  @GetAllProductStatsDocs()
  findAll() {
    return this.service.findAll();
  }

  // GET /product-stats/:id_produit
  @Get(':id_produit')
  @GetProductStatsByIdDocs()
  findByProduct(@Param('id_produit') id: string) {
    return this.service.findByProduct(id);
  }

  // POST /product-stats/:id_produit → mise à jour quantité
  @Post(':id_produit')
  @UpdateStockDocs()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  updateQuantity(@Param('id_produit') id: string, @Body() body: { quantite_en_stock: number }) {
    return this.service.updateByProduct(id, { quantite_en_stock: body.quantite_en_stock });
  }

  // POST /product-stats/:id_produit/sell → incrémente les ventes
  @Post(':id_produit/sell')
  //todo: voir pour les accès -> l'utilisateur ne doit pas pouvoir y accéder, mais le site oui (pas un admin manuellement)
  @SellProductDocs()
  incrementSales(@Param('id_produit') id: string, @Body() body?: { quantity?: number }) {
    const value = body?.quantity ?? 1;
    return this.service.incrementSales(id, value);
  }

  // POST /product-stats/:id_produit/restock → augmente le stock
  @Post(':id_produit/restock')
  @RestockProductDocs()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  restock(@Param('id_produit') id: string, @Body() body: { quantity: number }) {
    const quantity = body?.quantity ?? 0;
    return this.service.restock(id, quantity);
  }

  // Note:
  //  Pas de route create ni de route delete
  //  La création et suppression des statistiques se fait en même temps que celles du produit lui-même (dans products.service.ts)
}
