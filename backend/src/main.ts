import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Get ConfigService to access environment variables
  const configService = app.get(ConfigService);

  // Enable cookie parser for secure authentication
  app.use(cookieParser());

  // Enable CORS for frontend
  // Allow multiple origins (local dev + deployed frontend + optional FRONTEND_URL env)
  const allowedOrigins: string[] = [
    'http://localhost:3001',
    // Deployed frontend on Vercel
    'https://achetez-fr-dc1v.vercel.app',
  ];

  const frontendUrlEnv = configService.get<string>('FRONTEND_URL');
  if (frontendUrlEnv) {
    allowedOrigins.push(frontendUrlEnv);
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no Origin header)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`), false);
    },
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

  // Get port from environment variables (.env file or system environment)
  const port = parseInt(configService.get<string>('PORT') || '3000', 10);

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

  try {
    await app.listen(port, '0.0.0.0');
    logger.log(`Application is running on: http://0.0.0.0:${port}`);
    logger.log(`Port ${port} is now listening`);
  } catch (error) {
    logger.error(`Failed to start application on port ${port}:`, error);
    process.exit(1);
  }
}
bootstrap();
