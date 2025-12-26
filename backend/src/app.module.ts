import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProductsModule } from './modules/products/products.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { StatsModule } from './modules/stats/stats.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { UploadModule } from './modules/upload/upload.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // dispo partout sans re-import
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('MongoDBConfig');
        const logPath = '/home/napi/Storage/Etud/techno-web-groupe10/.cursor/debug.log';
        
        // #region agent log
        try {
          fs.appendFileSync(
            logPath,
            JSON.stringify({
              location: 'app.module.ts:27',
              message: 'Checking MONGODB_URI env var',
              data: { hasMongodbUri: !!configService.get<string>('MONGODB_URI') },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'A',
            }) + '\n',
          );
        } catch {
          // Ignore file write errors (e.g., on Render)
        }
        // #endregion
        
        // Support direct MONGODB_URI connection string (takes precedence)
        const mongodbUri = configService.get<string>('MONGODB_URI');
        
        // #region agent log
        try {
          fs.appendFileSync(
            logPath,
            JSON.stringify({
              location: 'app.module.ts:30',
              message: 'MONGODB_URI value check',
              data: {
                mongodbUriSet: !!mongodbUri,
                mongodbUriLength: mongodbUri?.length || 0,
                mongodbUriStart: mongodbUri?.substring(0, 30) || 'none',
                mongodbUriEnd: mongodbUri?.substring(Math.max(0, (mongodbUri?.length || 0) - 30)) || 'none',
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'A',
            }) + '\n',
          );
        } catch {
          // Ignore file write errors
        }
        // #endregion
        
        if (mongodbUri) {
          // #region agent log
          try {
            fs.appendFileSync(
              logPath,
              JSON.stringify({
                location: 'app.module.ts:33',
                message: 'Using MONGODB_URI path',
                data: {
                  uriLength: mongodbUri.length,
                  uriContainsCluster: mongodbUri.includes('cluster0'),
                  uriContainsAppName: mongodbUri.includes('appName'),
                  uriContainsNabil: mongodbUri.includes('nabil'),
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'B',
              }) + '\n',
            );
          } catch {
            // Ignore file write errors
          }
          // #endregion
          logger.log(
            `[DEBUG] Using MONGODB_URI connection string (length: ${mongodbUri.length}, contains cluster0: ${mongodbUri.includes('cluster0')}, contains nabil: ${mongodbUri.includes('nabil')})`,
          );
          return {
            uri: mongodbUri,
          };
        }
        
        // Fallback to old method for backward compatibility
        const user = configService.get<string>('DB_USER');
        const pass = configService.get<string>('DB_PASSWORD');
        const name = configService.get<string>('DB_NAME');
        const url = configService.get<string>('DB_URL');
        
        // #region agent log
        try {
          fs.appendFileSync(
            logPath,
            JSON.stringify({
              location: 'app.module.ts:52',
              message: 'Using fallback DB config',
              data: {
                hasUser: !!user,
                hasPass: !!pass,
                hasName: !!name,
                hasUrl: !!url,
                dbName: name || 'none',
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'A',
            }) + '\n',
          );
        } catch {
          // Ignore file write errors
        }
        // #endregion
        
        const fallbackUri = `mongodb+srv://${user}:${pass}@${name}.${url}/?retryWrites=true&w=majority&appName=${name}`;
        
        // #region agent log
        try {
          fs.appendFileSync(
            logPath,
            JSON.stringify({
              location: 'app.module.ts:57',
              message: 'Fallback URI constructed',
              data: {
                fallbackUriLength: fallbackUri.length,
                fallbackUriContainsCluster: fallbackUri.includes('cluster0'),
                fallbackUriContainsOldDb: fallbackUri.includes('achetez'),
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'A',
            }) + '\n',
          );
        } catch {
          // Ignore file write errors
        }
        // #endregion
        
        logger.warn(
          `[DEBUG] MONGODB_URI not set, using fallback method with DB: ${name} (URI contains cluster0: ${fallbackUri.includes('cluster0')}, contains achetez: ${fallbackUri.includes('achetez')})`,
        );
        return {
          uri: fallbackUri,
        };
      },
      inject: [ConfigService],
    }),
    // Serve static files from uploads directory
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ProductsModule,
    AuthModule,
    UsersModule,
    CartModule,
    OrdersModule,
    StatsModule,
    CategoriesModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
