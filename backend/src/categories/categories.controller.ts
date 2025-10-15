import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { Category } from './category.schema';
import { CategoriesService } from './categories.service';
import { ProductsService } from '../products/products.service';

@Controller('category')
export class CategoriesController {
  constructor(
    private readonly service: CategoriesService,
    private readonly productsService: ProductsService, // pour accéder aux produits
  ) {}
  @Get()
  findAll(): Promise<Category[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Category> {
    return this.service.findOne(id);
  }

  @Post('/create')
  create(@Body() data: Partial<Category>): Promise<Category> {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Category>): Promise<Category> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Category> {
    return this.service.remove(id);
  }

  // Liste des produits d'une catégorie
  @Get(':id/products')
  async findProduitsByCategorie(@Param('id') id: string) {
    return this.productsService.findByCategory(id);
  }
}
