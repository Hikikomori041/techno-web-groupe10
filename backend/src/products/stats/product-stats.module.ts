import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductStats, ProductStatsSchema } from './product-stats.schema';
import { ProductStatsService } from './product-stats.service';
import { ProductStatsController } from './product-stats.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ProductStats.name, schema: ProductStatsSchema }]),
  ],
  controllers: [ProductStatsController],
  providers: [ProductStatsService],
  exports: [ProductStatsService],
})
export class ProductStatsModule {}
