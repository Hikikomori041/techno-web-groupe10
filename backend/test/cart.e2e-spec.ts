import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Cart } from '../src/modules/cart/schemas/cart.schema';
import { Product } from '../src/modules/products/schemas/product.schema';
import { User } from '../src/modules/users/schemas/user.schema';
import { Category } from '../src/modules/categories/schemas/category.schema';
import { Types } from 'mongoose';

describe('Cart (e2e)', () => {
  let app: INestApplication;
  let cartModel: any;
  let productModel: any;
  let userModel: any;
  let categoryModel: any;
  let userCookie: string;
  let testProductId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    
    cartModel = moduleFixture.get(getModelToken(Cart.name));
    productModel = moduleFixture.get(getModelToken(Product.name));
    userModel = moduleFixture.get(getModelToken(User.name));
    categoryModel = moduleFixture.get(getModelToken(Category.name));
    
    await app.init();

    // Setup test data
    await userModel.deleteMany({ email: 'cart-test@example.com' });
    await categoryModel.deleteMany({ name: 'Test Category Cart' });
    await productModel.deleteMany({ nom: 'Test Product Cart' });

    // Create test category
    const category = await categoryModel.create({
      name: 'Test Category Cart',
      isActive: true,
    });

    // Create test product
    const product = await productModel.create({
      nom: 'Test Product Cart',
      prix: 99.99,
      categoryId: category._id,
      quantite_en_stock: 100,
      specifications: [],
      moderatorId: new Types.ObjectId(),
    });
    testProductId = product._id.toString();

    // Register and login user
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'cart-test@example.com',
        password: 'Test123!',
        firstName: 'Cart',
        lastName: 'Test',
      });

    userCookie = registerRes.headers['set-cookie'];
  });

  afterAll(async () => {
    await cartModel.deleteMany({});
    await productModel.deleteMany({ nom: 'Test Product Cart' });
    await categoryModel.deleteMany({ name: 'Test Category Cart' });
    await userModel.deleteMany({ email: 'cart-test@example.com' });
    await app.close();
  });

  beforeEach(async () => {
    // Clear cart before each test
    await cartModel.deleteMany({});
  });

  describe('/cart (GET)', () => {
    it('should return empty cart for new user', () => {
      return request(app.getHttpServer())
        .get('/cart')
        .set('Cookie', userCookie)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body.items).toEqual([]);
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/cart')
        .expect(401);
    });
  });

  describe('/cart/add (POST)', () => {
    it('should add product to cart', () => {
      return request(app.getHttpServer())
        .post('/cart/add')
        .set('Cookie', userCookie)
        .send({
          productId: testProductId,
          quantity: 2,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body.items.length).toBeGreaterThan(0);
        });
    });

    it('should fail with invalid product id', () => {
      return request(app.getHttpServer())
        .post('/cart/add')
        .set('Cookie', userCookie)
        .send({
          productId: '507f1f77bcf86cd799439011',
          quantity: 1,
        })
        .expect(404);
    });

    it('should fail with quantity exceeding stock', () => {
      return request(app.getHttpServer())
        .post('/cart/add')
        .set('Cookie', userCookie)
        .send({
          productId: testProductId,
          quantity: 1000,
        })
        .expect(400);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/cart/add')
        .send({
          productId: testProductId,
          quantity: 1,
        })
        .expect(401);
    });
  });

  describe('/cart/update/:itemId (PUT)', () => {
    it('should update cart item quantity', async () => {
      // Add item first
      const addRes = await request(app.getHttpServer())
        .post('/cart/add')
        .set('Cookie', userCookie)
        .send({
          productId: testProductId,
          quantity: 2,
        });

      const itemId = addRes.body.items[0]._id;

      return request(app.getHttpServer())
        .put(`/cart/update/${itemId}`)
        .set('Cookie', userCookie)
        .send({ quantity: 5 })
        .expect(200)
        .expect((res) => {
          const item = res.body.items.find((i: any) => i._id === itemId);
          expect(item.quantity).toBe(5);
        });
    });
  });

  describe('/cart/remove/:itemId (DELETE)', () => {
    it('should remove item from cart', async () => {
      // Add item first
      const addRes = await request(app.getHttpServer())
        .post('/cart/add')
        .set('Cookie', userCookie)
        .send({
          productId: testProductId,
          quantity: 2,
        });

      const itemId = addRes.body.items[0]._id;

      return request(app.getHttpServer())
        .delete(`/cart/remove/${itemId}`)
        .set('Cookie', userCookie)
        .expect(200)
        .expect((res) => {
          const item = res.body.items.find((i: any) => i._id === itemId);
          expect(item).toBeUndefined();
        });
    });
  });

  describe('/cart/clear (DELETE)', () => {
    it('should clear entire cart', async () => {
      // Add items first
      await request(app.getHttpServer())
        .post('/cart/add')
        .set('Cookie', userCookie)
        .send({
          productId: testProductId,
          quantity: 2,
        });

      return request(app.getHttpServer())
        .delete('/cart/clear')
        .set('Cookie', userCookie)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });
  });
});

