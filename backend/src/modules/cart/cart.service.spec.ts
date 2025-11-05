import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CartService } from './cart.service';
import { Cart } from './schemas/cart.schema';
import { Product } from '../products/schemas/product.schema';
import { NotFoundException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;
  let cartModel: Model<Cart>;
  let productModel: Model<Product>;

  const mockUserId = new Types.ObjectId().toString();
  const mockProductId = new Types.ObjectId().toString();

  const mockProduct = {
    _id: mockProductId,
    nom: 'Test Product',
    prix: 100,
    quantite_en_stock: 50,
    categoryId: new Types.ObjectId(),
    specifications: [],
  };

  const mockCart = {
    _id: new Types.ObjectId().toString(),
    userId: new Types.ObjectId(mockUserId),
    items: [
      {
        productId: mockProduct,
        quantity: 2,
        price: 100,
      },
    ],
    save: jest.fn().mockResolvedValue(this),
  };

  const mockCartModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  const mockProductModel = {
    findById: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const mockProductsService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getModelToken(Cart.name),
          useValue: mockCartModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
        {
          provide: 'ProductsService',
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartModel = module.get<Model<Cart>>(getModelToken(Cart.name));
    productModel = module.get<Model<Product>>(getModelToken(Product.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCart', () => {
    it('should return user cart', async () => {
      jest.spyOn(mockCartModel, 'findOne').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(mockCart),
        }),
      } as any);

      const result = await service.getCart(mockUserId);
      expect(result).toEqual(mockCart);
    });

    it('should return empty cart if not found', async () => {
      jest.spyOn(mockCartModel, 'findOne').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(null),
        }),
      } as any);

      const result = await service.getCart(mockUserId);
      expect(result).toEqual({ userId: mockUserId, items: [] });
    });
  });

  describe('addToCart', () => {
    it('should add product to cart', async () => {
      jest.spyOn(mockProductModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockProduct),
      } as any);

      jest.spyOn(mockCartModel, 'findOne').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(null),
        }),
      } as any);

      const newCart = { ...mockCart, save: jest.fn().mockResolvedValue(mockCart) };
      jest.spyOn(mockCartModel, 'create').mockResolvedValueOnce(newCart as any);

      const result = await service.addToCart(mockUserId, {
        productId: mockProductId,
        quantity: 2,
      });

      expect(result).toBeDefined();
      expect(mockProductModel.findById).toHaveBeenCalledWith(mockProductId);
    });

    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(mockProductModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        service.addToCart(mockUserId, { productId: mockProductId, quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if insufficient stock', async () => {
      const lowStockProduct = { ...mockProduct, quantite_en_stock: 1 };
      jest.spyOn(mockProductModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(lowStockProduct),
      } as any);

      jest.spyOn(mockCartModel, 'findOne').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(null),
        }),
      } as any);

      await expect(
        service.addToCart(mockUserId, { productId: mockProductId, quantity: 10 }),
      ).rejects.toThrow();
    });
  });

  describe('clearCart', () => {
    it('should clear user cart', async () => {
      jest.spyOn(mockCartModel, 'findOneAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCart),
      } as any);

      await service.clearCart(mockUserId);
      expect(mockCartModel.findOneAndDelete).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId),
      });
    });
  });
});

