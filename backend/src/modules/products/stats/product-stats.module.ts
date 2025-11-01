import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductStats, ProductStatsSchema } from './product-stats.schema';
import { ProductStatsService } from './product-stats.service';
import { ProductStatsController } from './product-stats.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ProductStats.name, schema: ProductStatsSchema }]),
    AuthModule,
  ],
  controllers: [ProductStatsController],
  providers: [ProductStatsService],
  exports: [ProductStatsService],
})
export class ProductStatsModule {}
