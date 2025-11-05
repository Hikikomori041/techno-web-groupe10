import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Product } from '../schemas/product.schema';
import { ProductsService } from '../services/products.service';
import { ProductStatsService } from '../stats/product-stats.service';
import { AiDescriptionService } from '../ai-description.service';
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
    private readonly aiDescriptionService: AiDescriptionService,
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
    
    console.log('🎯 CONTROLLER - Received product data:', {
      nom: product.nom,
      categoryId: product.categoryId,
      prix: product.prix,
      specifications: product.specifications?.length || 0,
    });
    
    // Validate categoryId
    if (!product.categoryId) {
      console.error('❌ CONTROLLER - No categoryId in request body!');
      throw new Error('CategoryId is required');
    }
    
    // Generate AI description if no description provided
    if (!product.description || product.description.trim() === '') {
      try {
        const description = await this.aiDescriptionService.generateDescription({
          nom: product.nom,
          prix: product.prix,
          specifications: product.specifications,
        });
        product.description = description;
      } catch (error) {
        console.error('Error generating AI description:', error);
        // Continue without description if AI generation fails
      }
    }
    
    const newProduct = await this.service.create(product, userId);

    // Crée la fiche de stats associée (même ID) - pour le tracking des ventes seulement
    await this.productStatsService.create({
      _id: newProduct._id as Types.ObjectId,
      quantite_en_stock: 0, // Deprecated: now using product.quantite_en_stock
      nombre_de_vente: 0,
    });

    console.log('🎉 CONTROLLER - Product created successfully with category:', newProduct.categoryId);
    return newProduct;
  }

  @Post(':id/generate-description')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiOperation({ summary: 'Generate AI description for product', description: 'Generate an AI-powered description for an existing product' })
  @ApiResponse({ status: 200, description: 'Description generated successfully', schema: { type: 'object', properties: { description: { type: 'string' } } } })
  async generateDescription(@Param('id') id: string) {
    const product = await this.service.findOne(id);
    if (!product) {
      throw new Error('Product not found');
    }

    const description = await this.aiDescriptionService.generateDescription({
      nom: product.nom,
      prix: product.prix,
      specifications: product.specifications,
    });

    // Update product with new description
    await this.service.update(id, { description }, product.moderatorId?.toString() || '', [Role.ADMIN]);

    return { description };
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
