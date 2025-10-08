import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let createdId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /products → should create a product', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .send({
        nom: 'Test Product',
        prix: 49.99,
        id_categorie: 1,
      })
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.nom).toBe('Test Product');
    createdId = res.body._id;
  });

  it('GET /products → should return an array', async () => {
    const res = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /products/:id → should return one product', async () => {
    const res = await request(app.getHttpServer())
      .get(`/products/${createdId}`)
      .expect(200);

    expect(res.body).toHaveProperty('_id', createdId);
    expect(res.body.nom).toBe('Test Product');
  });

  it('PUT /products/:id → should update a product', async () => {
    const res = await request(app.getHttpServer())
      .put(`/products/${createdId}`)
      .send({
        prix: 59.99,
        description: 'Produit modifié pour le test',
      })
      .expect(200);

    expect(res.body._id).toBe(createdId);
    expect(res.body.prix).toBe(59.99);
    expect(res.body.description).toBe('Produit modifié pour le test');
  });

  it('DELETE /products/:id → should delete a product', async () => {
    await request(app.getHttpServer())
      .delete(`/products/${createdId}`)
      .expect(200);

    // Vérifier que le produit n’existe plus
    await request(app.getHttpServer())
      .get(`/products/${createdId}`)
      .expect(200)
      .then(res => {
        expect(res.body).toEqual({}); // ou null selon ton controller
      });
  });
});
