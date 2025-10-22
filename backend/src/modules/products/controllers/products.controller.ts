import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Product } from '../schemas/product.schema';
import { ProductsService } from '../services/products.service';
import { ProductStatsService } from '../stats/product-stats.service';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FilterProductsDto } from '../dto/filter-products.dto';
import {
  GetAllProductsDocs,
  GetProductByIdDocs,
  CreateProductDocs,
  UpdateProductDocs,
  DeleteProductDocs,
} from '../products.swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly service: ProductsService,
    private readonly productStatsService: ProductStatsService,
  ) {}


  @Get()
  @ApiOperation({ 
    summary: 'Get all products with filters and pagination', 
    description: 'Retrieve products with optional filters (category, price range, search, stock status, specifications) and pagination support' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Products retrieved successfully with pagination info',
    schema: {
      type: 'object',
      properties: {
        products: { type: 'array', items: { type: 'object' } },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 12 },
        totalPages: { type: 'number', example: 5 },
        hasMore: { type: 'boolean', example: true },
      },
    },
  })
  async findAll(@Query() filterDto: FilterProductsDto) {
    // Public endpoint with filters and pagination
    return this.service.findAllWithFilters(filterDto);
  }

  @Get('dashboard/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  async findAllForDashboard(@Request() req): Promise<Product[]> {
    // Protected endpoint - filters products for moderators
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    console.log('📋 Dashboard Products Request:', { userId, userRoles });
    return this.service.findAll(userId, userRoles);
  }

  @Get(':id')
  @GetProductByIdDocs()
  async findOne(@Param('id') id: string): Promise<Product | null> {
    return this.service.findOne(id);
  }

  @Post('/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @CreateProductDocs()
  async create(@Request() req, @Body() product: CreateProductDto) {
    const userId = req.user.userId;
    const newProduct = await this.service.create(product, userId);

    // Crée la fiche de stats associée (même ID) - pour le tracking des ventes seulement
    await this.productStatsService.create({
      _id: newProduct._id as Types.ObjectId,
      quantite_en_stock: 0, // Deprecated: now using product.quantite_en_stock
      nombre_de_vente: 0,
    });

    return newProduct;
  }


  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @UpdateProductDocs()
  async update(@Request() req, @Param('id') id: string, @Body() product: UpdateProductDto): Promise<Product | null> {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    return this.service.update(id, product, userId, userRoles);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @DeleteProductDocs()
  async remove(@Request() req, @Param('id') id: string): Promise<Product | null> {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    return this.service.remove(id, userId, userRoles);
  }
}
