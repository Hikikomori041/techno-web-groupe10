import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ProductStatsService } from './product-stats.service';
import { ProductStats } from './product-stats.schema';

@Controller('product-stats')
export class ProductStatsController {
  constructor(private readonly service: ProductStatsService) {}

  // GET /product-stats
  @Get()
  findAll(@Query('details') details?: string) {
    const showDetails = details === 'true';
    return this.service.findAll(showDetails);
  }

  // GET /product-stats/:id
  @Get(':id')
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
  updateQuantity(@Param('id_produit') id: string, @Body() body: { quantite_en_stock: number }) {
    return this.service.updateByProduct(id, { quantite_en_stock: body.quantite_en_stock });
  }

  // POST /product-stats/:id_produit/sell → incrémente les ventes
  @Post(':id_produit/sell')
  incrementSales(
    @Param('id_produit') id: string,
    @Body() body?: { increment?: number }
  ) {
    const value = body?.increment ?? 1;
    return this.service.incrementSales(id, value);
  }

  // 📦 POST /product-stats/:id_produit/restock → augmente le stock
  @Post(':id_produit/restock')
  restock(
    @Param('id_produit') id: string,
    @Body() body: { quantity: number }
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
