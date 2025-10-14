import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './products/products.module';
import { ProductStatsModule } from './product-stats/product-stats.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // dispo partout sans re-import
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const user = configService.get<string>('DB_USER');
        const pass = configService.get<string>('DB_PASSWORD');
        const name = configService.get<string>('DB_NAME');
        const url = configService.get<string>('DB_URL');
        return {
          uri: `mongodb+srv://${user}:${pass}@${name}.${url}/?retryWrites=true&w=majority&appName=${name}`,
        };
      },
      inject: [ConfigService],
    }),
    ProductsModule,
    ProductStatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
