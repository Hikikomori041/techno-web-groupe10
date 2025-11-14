import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, Query, Logger, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  GetAllProductsWithFiltersDocs,
  GetProductByIdDocs,
  CreateProductDocs,
  UpdateProductDocs,
  DeleteProductDocs,
  GenerateDescriptionDocs,
} from '../products.swagger';
import { ProductMapper } from '../mappers/product.mapper';
import { ProductResponseDto } from '../dto/product-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(
    private readonly service: ProductsService,
    private readonly productStatsService: ProductStatsService,
    private readonly aiDescriptionService: AiDescriptionService,
  ) {}


  @Get()
  @GetAllProductsWithFiltersDocs()
  async findAll(@Query() filterDto: FilterProductsDto) {
    // Public endpoint with filters and pagination
    const filters = ProductMapper.fromFilterDto(filterDto);
    const result = await this.service.findAllWithFilters(filters);
    return {
      ...result,
      products: ProductMapper.toResponseList(result.products),
    };
  }

  @Get('dashboard/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  async findAllForDashboard(@Request() req): Promise<ProductResponseDto[]> {
    // Protected endpoint - filters products for moderators
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    this.logger.debug('Dashboard products request', { userId, roles: userRoles });
    const products = await this.service.findAll(userId, userRoles);
    return ProductMapper.toResponseList(products);
  }

  @Get(':id')
  @GetProductByIdDocs()
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    const product = await this.service.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return ProductMapper.toResponse(product);
  }

  @Post('/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @CreateProductDocs()
  async create(@Request() req, @Body() product: CreateProductDto): Promise<ProductResponseDto> {
    const userId = req.user.userId;
    
    this.logger.debug('Received product data', {
      nom: product.nom,
      categoryId: product.categoryId,
      prix: product.prix,
      specifications: product.specifications?.length || 0,
    });
    
    // Validate categoryId
    if (!product.categoryId) {
      this.logger.error('No categoryId in request body');
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
        this.logger.warn(`Error generating AI description: ${(error as Error).message}`);
        // Continue without description if AI generation fails
      }
    }
    
    const input = ProductMapper.fromCreateDto(product, userId);
    const newProduct = await this.service.create(input);

    // Crée la fiche de stats associée (même ID) - pour le tracking des ventes seulement
    await this.productStatsService.create({
      _id: newProduct._id as Types.ObjectId,
      quantite_en_stock: 0, 
      nombre_de_vente: 0,
    });

    this.logger.debug('Product created successfully', { productId: newProduct._id, categoryId: newProduct.categoryId });
    return ProductMapper.toResponse(newProduct);
  }

  @Post(':id/generate-description')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @GenerateDescriptionDocs()
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
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() product: UpdateProductDto,
  ): Promise<ProductResponseDto | null> {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    const updateInput = ProductMapper.fromUpdateDto(product);
    const updated = await this.service.update(id, updateInput, userId, userRoles);
    return updated ? ProductMapper.toResponse(updated) : null;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @DeleteProductDocs()
  async remove(@Request() req, @Param('id') id: string): Promise<ProductResponseDto | null> {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    const removed = await this.service.remove(id, userId, userRoles);
    return removed ? ProductMapper.toResponse(removed) : null;
  }
}
