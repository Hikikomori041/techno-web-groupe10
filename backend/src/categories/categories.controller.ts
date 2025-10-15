import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Category } from './category.schema';
import { CategoriesService } from './categories.service';
import { ProductsService } from '../products/products.service';

@ApiTags('Catégories')
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiBody({
    schema: {
      example: {
        name: 'Catégorie',
        id_categorie_mere: '68ef526cbdfb36f434d021ce',
      },
    },
  })
  create(@Body() data: Partial<Category>): Promise<Category> {
    return this.service.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiBody({
    schema: {
      example: {
        name: 'Catégorie',
        id_categorie_mere: '68ef526cbdfb36f434d021ce',
      },
    },
  })
  update(@Param('id') id: string, @Body() data: Partial<Category>): Promise<Category> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string): Promise<Category> {
    return this.service.remove(id);
  }

  // Liste des produits d'une catégorie
  @Get(':id/products')
  async findProduitsByCategorie(@Param('id') id: string) {
    return this.productsService.findByCategory(id);
  }
}
