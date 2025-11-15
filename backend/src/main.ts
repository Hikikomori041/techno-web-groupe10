import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable cookie parser for secure authentication
  app.use(cookieParser());

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true, // Important: permet l'envoi de cookies
  });

  // Enable global exception filter for proper error handling
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger API Documentation (only in development or if ENABLE_SWAGGER=true)
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    try {
      const config = new DocumentBuilder()
        .setTitle('E-Commerce API - IT Materials')
        .setDescription('Complete API with authentication, products, user management, shopping cart, order management, categories, and analytics')
        .setVersion('1.0')
        .addTag('auth', 'Authentication endpoints')
        .addTag('users', 'User management endpoints (Admin only)')
        .addTag('categories', 'Product categories management (Admin only for CUD operations)')
        .addTag('products', 'Product management endpoints with filtering and pagination')
        .addTag('product-stats', 'Product statistics endpoints')
        .addTag('cart', 'Shopping cart endpoints (Authenticated users)')
        .addTag('orders', 'Order management endpoints (Users and Admin)')
        .addTag('stats', 'Dashboard statistics and analytics (Admin/Moderator)')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
          },
          'JWT-auth',
        )
        .build();

      const swaggerDocument = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api', app, swaggerDocument);
      logger.log(`Swagger docs available at: http://localhost:${port}/api`);
    } catch (error) {
      logger.warn('Failed to setup Swagger documentation', error);
    }
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
