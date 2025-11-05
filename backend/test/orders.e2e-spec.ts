import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Order } from '../src/modules/orders/schemas/order.schema';
import { Cart } from '../src/modules/cart/schemas/cart.schema';
import { Product } from '../src/modules/products/schemas/product.schema';
import { User } from '../src/modules/users/schemas/user.schema';
import { Category } from '../src/modules/categories/schemas/category.schema';
import { Types } from 'mongoose';

describe('Orders (e2e)', () => {
  let app: INestApplication;
  let orderModel: any;
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
    
    orderModel = moduleFixture.get(getModelToken(Order.name));
    cartModel = moduleFixture.get(getModelToken(Cart.name));
    productModel = moduleFixture.get(getModelToken(Product.name));
    userModel = moduleFixture.get(getModelToken(User.name));
    categoryModel = moduleFixture.get(getModelToken(Category.name));
    
    await app.init();

    // Setup test data
    await userModel.deleteMany({ email: 'order-test@example.com' });
    await categoryModel.deleteMany({ name: 'Test Category Order' });
    await productModel.deleteMany({ nom: 'Test Product Order' });

    // Create test category
    const category = await categoryModel.create({
      name: 'Test Category Order',
      isActive: true,
    });

    // Create test product
    const product = await productModel.create({
      nom: 'Test Product Order',
      prix: 149.99,
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
        email: 'order-test@example.com',
        password: 'Test123!',
        firstName: 'Order',
        lastName: 'Test',
      });

    userCookie = registerRes.headers['set-cookie'];
  });

  afterAll(async () => {
    await orderModel.deleteMany({});
    await cartModel.deleteMany({});
    await productModel.deleteMany({ nom: 'Test Product Order' });
    await categoryModel.deleteMany({ name: 'Test Category Order' });
    await userModel.deleteMany({ email: 'order-test@example.com' });
    await app.close();
  });

  beforeEach(async () => {
    await orderModel.deleteMany({});
    await cartModel.deleteMany({});
  });

  describe('/orders (POST)', () => {
    it('should create an order from cart', async () => {
      // Add product to cart first
      await request(app.getHttpServer())
        .post('/cart/add')
        .set('Cookie', userCookie)
        .send({
          productId: testProductId,
          quantity: 2,
        });

      return request(app.getHttpServer())
        .post('/orders')
        .set('Cookie', userCookie)
        .send({
          street: '123 Test Street',
          city: 'Paris',
          postalCode: '75001',
          country: 'France',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('totalAmount');
          expect(res.body).toHaveProperty('shippingAddress');
          expect(res.body.shippingAddress.city).toBe('Paris');
        });
    });

    it('should fail with empty cart', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Cookie', userCookie)
        .send({
          street: '123 Test Street',
          city: 'Paris',
          postalCode: '75001',
          country: 'France',
        })
        .expect(400);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .send({
          street: '123 Test Street',
          city: 'Paris',
          postalCode: '75001',
          country: 'France',
        })
        .expect(401);
    });
  });

  describe('/orders (GET)', () => {
    it('should return user orders', async () => {
      // Create an order first
      await request(app.getHttpServer())
        .post('/cart/add')
        .set('Cookie', userCookie)
        .send({
          productId: testProductId,
          quantity: 1,
        });

      await request(app.getHttpServer())
        .post('/orders')
        .set('Cookie', userCookie)
        .send({
          street: '456 Test Ave',
          city: 'Lyon',
          postalCode: '69001',
          country: 'France',
        });

      return request(app.getHttpServer())
        .get('/orders')
        .set('Cookie', userCookie)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/orders/:id (GET)', () => {
    it('should return order details', async () => {
      // Create an order
      await request(app.getHttpServer())
        .post('/cart/add')
        .set('Cookie', userCookie)
        .send({
          productId: testProductId,
          quantity: 1,
        });

      const orderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Cookie', userCookie)
        .send({
          street: '789 Test Blvd',
          city: 'Marseille',
          postalCode: '13001',
          country: 'France',
        });

      const orderId = orderRes.body._id;

      return request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Cookie', userCookie)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id', orderId);
          expect(res.body).toHaveProperty('totalAmount');
        });
    });
  });

  describe('/orders/:id/status (PUT)', () => {
    it('should update order status with admin auth', async () => {
      // Create admin user
      await userModel.deleteMany({ email: 'admin-order@example.com' });
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin-order@example.com',
          password: 'Admin123!',
          firstName: 'Admin',
          lastName: 'Order',
        });

      const adminUser = await userModel.findOne({ email: 'admin-order@example.com' });
      await userModel.findByIdAndUpdate(adminUser._id, { roles: ['admin'] });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin-order@example.com',
          password: 'Admin123!',
        });

      const adminCookie = loginRes.headers['set-cookie'];

      // Create order
      await request(app.getHttpServer())
        .post('/cart/add')
        .set('Cookie', userCookie)
        .send({
          productId: testProductId,
          quantity: 1,
        });

      const orderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Cookie', userCookie)
        .send({
          street: 'Test St',
          city: 'Paris',
          postalCode: '75001',
          country: 'France',
        });

      const orderId = orderRes.body._id;

      return request(app.getHttpServer())
        .put(`/orders/${orderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'shipped' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('shipped');
        });
    });
  });

  describe('/orders/:id (DELETE)', () => {
    it('should cancel an order', async () => {
      // Create order
      await request(app.getHttpServer())
        .post('/cart/add')
        .set('Cookie', userCookie)
        .send({
          productId: testProductId,
          quantity: 1,
        });

      const orderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Cookie', userCookie)
        .send({
          street: 'Cancel St',
          city: 'Paris',
          postalCode: '75001',
          country: 'France',
        });

      const orderId = orderRes.body._id;

      return request(app.getHttpServer())
        .delete(`/orders/${orderId}`)
        .set('Cookie', userCookie)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('cancelled');
        });
    });
  });
});

