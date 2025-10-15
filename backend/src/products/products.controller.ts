import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { Product } from './product.schema';
import { ProductsService } from './products.service';
import { ProductStatsService } from '../product-stats/product-stats.service';
import { Types } from 'mongoose';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from 'src/auth/enums/role.enum';

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

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiBody({
    schema: {
      example: {
        "nom": "Ordinateur Fixe MSI Titan X",
        "prix": 2499.99,
        "description": "Ordinateur de bureau hautes performances équipé d'une RTX 4070 et d'un processeur Ryzen 7, idéal pour le gaming et la création.",
        "images": ["msi_titanx_front.jpg", "msi_titanx_side.jpg"],
        "specifications": {
          "cpu": "AMD Ryzen 7 7800X3D",
          "ram": "32GB DDR5",
          "gpu": "NVIDIA GeForce RTX 4070",
          "stockage": "1TB SSD NVMe",
          "carte_mere": "MSI B650 Tomahawk",
          "alimentation": "750W 80+ Gold"
        },
        "id_categorie": "68ef5292bdfb36f434d021d1"
      },
    },
  })
  async create(@Body() product: Partial<Product>) {
    const newProduct = await this.service.create(product);

    // Crée la fiche de stats liée à ce produit
    await this.productStatsService.create({
      product_id: new Types.ObjectId(String(newProduct._id)),
      quantite_en_stock: 0,
      nombre_de_vente: 0,
    });

    return newProduct;
  }


  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() product: Partial<Product>): Promise<Product | null> {
    return this.service.update(id, product);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<Product | null> {
    return this.service.remove(id);
  }
}
