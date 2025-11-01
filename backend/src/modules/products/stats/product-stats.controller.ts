import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductStatsService } from './product-stats.service';
import { ProductStats } from './product-stats.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { IncrementSalesDto } from './dto/increment-sales.dto';
import { RestockDto } from './dto/restock.dto';
import {
  GetAllStatsDocs,
  GetStatsByProductDocs,
  UpdateQuantityDocs,
  IncrementSalesDocs,
  RestockDocs,
} from './product-stats.swagger';

@ApiTags('product-stats')
@Controller('product-stats')
export class ProductStatsController {
  constructor(private readonly service: ProductStatsService) {}

  // GET /product-stats
  @Get()
  @GetAllStatsDocs()
  findAll(@Query('details') details?: string) {
    const showDetails = details === 'true';
    return this.service.findAll(showDetails);
  }

  // GET /product-stats/:id
  @Get(':id')
  @GetStatsByProductDocs()
  findByProduct(@Param('id') id: string, @Query('details') details?: string) {
    const showDetails = details === 'true';
    return this.service.findByProduct(id, showDetails);
  }

  // POST /product-stats
  // @Post()
  // create(@Body() data: Partial<ProductStats>) {
  //   return this.service.create(data);
  // }

  // POST /product-stats/:id_produit → mise à jour quantité
  @Post(':id_produit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @UpdateQuantityDocs()
  updateQuantity(@Param('id_produit') id: string, @Body() body: UpdateQuantityDto) {
    return this.service.updateByProduct(id, { quantite_en_stock: body.quantite_en_stock });
  }

  // POST /product-stats/:id_produit/sell → incrémente les ventes
  @Post(':id_produit/sell')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @IncrementSalesDocs()
  incrementSales(
    @Param('id_produit') id: string,
    @Body() body?: IncrementSalesDto
  ) {
    const value = body?.increment ?? 1;
    return this.service.incrementSales(id, value);
  }

  // 📦 POST /product-stats/:id_produit/restock → augmente le stock
  @Post(':id_produit/restock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @RestockDocs()
  restock(
    @Param('id_produit') id: string,
    @Body() body: RestockDto
  ) {
    const quantity = body?.quantity ?? 0;
    return this.service.restock(id, quantity);
  }



  // DELETE /product-stats/:id_produit
  // @Delete(':id_produit')
  // remove(@Param('id_produit') id: string) {
  //   return this.service.removeByProduct(id);
  // }
}
