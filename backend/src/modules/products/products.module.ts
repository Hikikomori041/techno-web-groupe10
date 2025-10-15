import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductStatsModule } from './stats/product-stats.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ProductStatsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
