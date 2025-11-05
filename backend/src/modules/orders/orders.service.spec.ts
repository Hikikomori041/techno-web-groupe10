import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';
import { Product } from '../products/schemas/product.schema';
import { Cart } from '../cart/schemas/cart.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderModel: Model<Order>;
  let productModel: Model<Product>;
  let cartModel: Model<Cart>;

  const mockUserId = new Types.ObjectId().toString();
  const mockProductId = new Types.ObjectId();

  const mockProduct = {
    _id: mockProductId,
    nom: 'Test Product',
    prix: 100,
    quantite_en_stock: 50,
    save: jest.fn(),
  };

  const mockCart = {
    userId: new Types.ObjectId(mockUserId),
    items: [
      {
        productId: mockProduct,
        quantity: 2,
        price: 100,
      },
    ],
  };

  const mockOrder = {
    _id: new Types.ObjectId().toString(),
    userId: new Types.ObjectId(mockUserId),
    items: mockCart.items,
    totalAmount: 200,
    shippingAddress: {
      street: '123 Test St',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
    },
    status: 'pending',
    paymentStatus: 'pending',
  };

  const mockOrderModel = {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    exec: jest.fn(),
  };

  const mockProductModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockCartModel = {
    findOne: jest.fn(),
    findOneAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
        {
          provide: getModelToken(Cart.name),
          useValue: mockCartModel,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderModel = module.get<Model<Order>>(getModelToken(Order.name));
    productModel = module.get<Model<Product>>(getModelToken(Product.name));
    cartModel = module.get<Model<Cart>>(getModelToken(Cart.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create an order from cart', async () => {
      const shippingAddress = {
        street: '123 Test St',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
      };

      jest.spyOn(mockCartModel, 'findOne').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(mockCart),
        }),
      } as any);

      jest.spyOn(mockProductModel, 'findByIdAndUpdate').mockResolvedValue(mockProduct as any);

      jest.spyOn(mockOrderModel, 'create').mockResolvedValue([mockOrder] as any);

      jest.spyOn(mockCartModel, 'findOneAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCart),
      } as any);

      const result = await service.createOrder(mockUserId, shippingAddress);

      expect(result).toBeDefined();
      expect(mockOrderModel.create).toHaveBeenCalled();
      expect(mockCartModel.findOneAndDelete).toHaveBeenCalled();
    });

    it('should throw BadRequestException if cart is empty', async () => {
      jest.spyOn(mockCartModel, 'findOne').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce({ items: [] }),
        }),
      } as any);

      await expect(
        service.createOrder(mockUserId, {
          street: 'Test',
          city: 'Paris',
          postalCode: '75001',
          country: 'France',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserOrders', () => {
    it('should return user orders', async () => {
      const orders = [mockOrder];
      jest.spyOn(mockOrderModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(orders),
        }),
      } as any);

      const result = await service.getUserOrders(mockUserId);
      expect(result).toEqual(orders);
      expect(mockOrderModel.find).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId),
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const updatedOrder = { ...mockOrder, status: 'shipped' };

      jest.spyOn(mockOrderModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(updatedOrder),
      } as any);

      const result = await service.updateOrderStatus(mockOrder._id, 'shipped');
      expect(result).toEqual(updatedOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      jest.spyOn(mockOrderModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.updateOrderStatus('invalid_id', 'shipped')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

