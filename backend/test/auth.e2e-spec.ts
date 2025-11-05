import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/modules/users/schemas/user.schema';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let userModel: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    
    userModel = moduleFixture.get(getModelToken(User.name));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean test users before each test
    await userModel.deleteMany({ email: /test.*@example\.com/ });
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test-register@example.com',
          password: 'Test123!',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('test-register@example.com');
          expect(res.headers['set-cookie']).toBeDefined();
        });
    });

    it('should fail with duplicate email', async () => {
      // Create first user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test-duplicate@example.com',
          password: 'Test123!',
          firstName: 'Test',
          lastName: 'User',
        });

      // Try to create duplicate
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test-duplicate@example.com',
          password: 'Test123!',
          firstName: 'Test2',
          lastName: 'User2',
        })
        .expect(409); // Conflict
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test123!',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should fail without required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          // Missing password, firstName, lastName
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test-login@example.com',
          password: 'Test123!',
          firstName: 'Test',
          lastName: 'User',
        });
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test-login@example.com',
          password: 'Test123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('user');
          expect(res.headers['set-cookie']).toBeDefined();
        });
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test-login@example.com',
          password: 'WrongPassword!',
        })
        .expect(401);
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123!',
        })
        .expect(401);
    });
  });

  describe('/auth/check (GET)', () => {
    it('should return authenticated user with valid token', async () => {
      // Register and login to get cookie
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test-login@example.com',
          password: 'Test123!',
        });

      const cookie = loginRes.headers['set-cookie'];

      return request(app.getHttpServer())
        .get('/auth/check')
        .set('Cookie', cookie)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('authenticated', true);
          expect(res.body).toHaveProperty('user');
        });
    });

    it('should return not authenticated without token', () => {
      return request(app.getHttpServer())
        .get('/auth/check')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('authenticated', false);
        });
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout and clear cookie', async () => {
      // Login first
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test-login@example.com',
          password: 'Test123!',
        });

      const cookie = loginRes.headers['set-cookie'];

      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', cookie)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Logout successful');
          const setCookieHeader = res.headers['set-cookie'];
          expect(setCookieHeader).toBeDefined();
          expect(setCookieHeader[0]).toContain('access_token=;');
        });
    });
  });
});

