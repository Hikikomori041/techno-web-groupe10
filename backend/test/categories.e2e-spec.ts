import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Category } from '../src/modules/categories/schemas/category.schema';
import { User } from '../src/modules/users/schemas/user.schema';

describe('Categories (e2e)', () => {
  let app: INestApplication;
  let categoryModel: any;
  let userModel: any;
  let adminCookie: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    
    categoryModel = moduleFixture.get(getModelToken(Category.name));
    userModel = moduleFixture.get(getModelToken(User.name));
    
    await app.init();

    // Create admin user and login
    await userModel.deleteMany({ email: 'admin-test@example.com' });
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin-test@example.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'Test',
      });

    // Update to admin role
    const adminUser = await userModel.findOne({ email: 'admin-test@example.com' });
    await userModel.findByIdAndUpdate(adminUser._id, { roles: ['admin'] });

    // Login to get cookie
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin-test@example.com',
        password: 'Admin123!',
      });

    adminCookie = loginRes.headers['set-cookie'];
  });

  afterAll(async () => {
    await categoryModel.deleteMany({ name: /^Test Category/ });
    await userModel.deleteMany({ email: 'admin-test@example.com' });
    await app.close();
  });

  beforeEach(async () => {
    await categoryModel.deleteMany({ name: /^Test Category/ });
  });

  describe('/categories (GET)', () => {
    it('should return all categories', async () => {
      // Create test categories
      await categoryModel.create([
        { name: 'Test Category 1', isActive: true },
        { name: 'Test Category 2', isActive: true },
      ]);

      return request(app.getHttpServer())
        .get('/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(2);
        });
    });
  });

  describe('/categories (POST)', () => {
    it('should create a new category with admin auth', () => {
      return request(app.getHttpServer())
        .post('/categories')
        .set('Cookie', adminCookie)
        .send({
          name: 'Test Category New',
          description: 'Test description',
          isActive: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Test Category New');
          expect(res.body).toHaveProperty('isActive', true);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/categories')
        .send({
          name: 'Test Category',
          isActive: true,
        })
        .expect(401);
    });

    it('should fail with duplicate name', async () => {
      await categoryModel.create({ name: 'Test Category Duplicate', isActive: true });

      return request(app.getHttpServer())
        .post('/categories')
        .set('Cookie', adminCookie)
        .send({
          name: 'Test Category Duplicate',
          isActive: true,
        })
        .expect(409); // Conflict
    });
  });

  describe('/categories/:id (PUT)', () => {
    it('should update a category', async () => {
      const category = await categoryModel.create({
        name: 'Test Category Update',
        isActive: true,
      });

      return request(app.getHttpServer())
        .put(`/categories/${category._id}`)
        .set('Cookie', adminCookie)
        .send({
          name: 'Test Category Updated',
          description: 'Updated description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Test Category Updated');
        });
    });

    it('should fail with invalid id', () => {
      return request(app.getHttpServer())
        .put('/categories/invalid-id')
        .set('Cookie', adminCookie)
        .send({ name: 'Updated' })
        .expect(400);
    });
  });

  describe('/categories/:id (DELETE)', () => {
    it('should delete a category', async () => {
      const category = await categoryModel.create({
        name: 'Test Category Delete',
        isActive: true,
      });

      return request(app.getHttpServer())
        .delete(`/categories/${category._id}`)
        .set('Cookie', adminCookie)
        .expect(200);
    });

    it('should fail with non-existent id', () => {
      return request(app.getHttpServer())
        .delete('/categories/507f1f77bcf86cd799439011')
        .set('Cookie', adminCookie)
        .expect(404);
    });
  });
});

