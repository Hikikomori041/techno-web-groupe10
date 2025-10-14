import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { Product } from './product.schema';
import { ProductsService } from './products.service';
import { ProductStatsService } from '../product-stats/product-stats.service';
import { Types } from 'mongoose';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly service: ProductsService,
    private readonly productStatsService: ProductStatsService,
  ) {}


  @Get()
  async findAll(): Promise<Product[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product | null> {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() product: Partial<Product>) {
    const newProduct = await this.service.create(product);

    // Crée la fiche de stats associée (même ID)
  await this.productStatsService.create({
      _id: newProduct._id as Types.ObjectId, // ✅ cast explicite
      quantite_en_stock: 0,
      nombre_de_vente: 0,
    });

    return newProduct;
  }


  @Put(':id')
  async update(@Param('id') id: string, @Body() product: Partial<Product>): Promise<Product | null> {
    return this.service.update(id, product);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Product | null> {
    return this.service.remove(id);
  }
}
