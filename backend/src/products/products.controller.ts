import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { Product } from './product.schema';
import { ProductsService } from './products.service';
import { ProductStatsService } from './stats/product-stats.service';
import { Types } from 'mongoose';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from 'src/auth/enums/role.enum';

import {
  GetAllProductsDocs,
  GetProductByIdDocs,
  CreateProductDocs,
  UpdateProductDocs,
  DeleteProductDocs,
  CountProductsInCategoryDocs,
} from './products.swagger';

@ApiTags('Produits')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly service: ProductsService,
    private readonly productStatsService: ProductStatsService,
  ) {}


  @Get()
  @GetAllProductsDocs()
  async findAll(): Promise<Product[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @GetProductByIdDocs()
  async findOne(@Param('id') id: string): Promise<Product | null> {
    return this.service.findOne(id);
  }

  @Post('/create')
  @CreateProductDocs()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async create(@Body() product: Partial<Product>) {
    const newProduct = await this.service.create(product);

    await this.productStatsService.create({
      id_produit: new Types.ObjectId(String(newProduct._id)),
      quantite_en_stock: 0,
      nombre_de_vente: 0,
    });

    return newProduct;
  }


  @Put(':id')
  @UpdateProductDocs()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() product: Partial<Product>,
  ): Promise<Product | null> {
    return this.service.update(id, product);
  }

  @Delete(':id')
  @DeleteProductDocs()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<Product | null> {
    return this.service.remove(id);
  }

  
  @Get('count/:id_categorie')
  @CountProductsInCategoryDocs()
  async countByCategory(
    @Param('id_categorie') categoryId: string,
    @Query('cascade') cascade?: string,
  ) {
    const cascadeBool = cascade === 'true'; // false par défaut si absent
    const count = await this.service.countByCategory(categoryId, cascadeBool);
    return { categoryId, cascade: cascadeBool, count };
  }
}
