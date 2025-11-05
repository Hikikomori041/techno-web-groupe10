import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderStatus, PaymentStatus } from './schemas/order.schema';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/services/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Role } from '../../common/enums/role.enum';
import { Product } from '../products/schemas/product.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private cartService: CartService,
    private productsService: ProductsService,
  ) {}

  // Generate unique order number
  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${year}${month}${day}-${random}`;
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    // 1. Get user's cart
    const cart = await this.cartService.getCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Votre panier est vide');
    }

    // 2. Validate stock availability and prepare order items
    const orderItems: any[] = [];
    
    for (const cartItem of cart.items) {
      const product = await this.productsService.findOne(cartItem.productId._id);
      
      if (!product) {
        throw new NotFoundException(`Produit ${cartItem.productId.nom} introuvable`);
      }

      // Check stock availability
      if (product.quantite_en_stock < cartItem.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${product.nom}. Disponible: ${product.quantite_en_stock}, Demandé: ${cartItem.quantity}`
        );
      }

      // Prepare order item with snapshot
      orderItems.push({
        productId: product._id as Types.ObjectId,
        productName: product.nom,
        productPrice: product.prix,
        quantity: cartItem.quantity,
        subtotal: cartItem.subtotal,
      });

      // Reduce stock - Use findByIdAndUpdate to avoid validation issues with existing bad data
      await this.productModel.findByIdAndUpdate(
        product._id,
        { $inc: { quantite_en_stock: -cartItem.quantity } },
        { new: true, runValidators: false } // Skip validators to avoid issues with bad existing data
      );
    }

    // 3. Create order
    const order = new this.orderModel({
      userId: new Types.ObjectId(userId),
      orderNumber: this.generateOrderNumber(),
      items: orderItems,
      total: cart.total,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      shippingAddress: createOrderDto.shippingAddress,
    });

    await order.save();

    // 4. Clear cart
    await this.cartService.clearCart(userId);

    // 5. Return order with populated product references
    return this.orderModel
      .findById(order._id)
      .populate('userId', 'firstName lastName email')
      .exec();
  }

  async getUserOrders(userId: string) {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getOrderById(orderId: string, userId: string, userRoles: string[]) {
    const order = await this.orderModel
      .findById(orderId)
      .populate('userId', 'firstName lastName email')
      .exec();

    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    // Check access
    const isAdmin = userRoles.includes(Role.ADMIN);
    const isModerator = userRoles.includes(Role.MODERATOR) && !isAdmin;
    const isOwner = order.userId._id.toString() === userId;

    if (isModerator) {
      // Moderator can only see orders containing their products
      const moderatorProducts = await this.productModel
        .find({ moderatorId: new Types.ObjectId(userId) })
        .select('_id')
        .exec();
      
      const productIds = moderatorProducts.map(p => (p._id as Types.ObjectId).toString());
      const hasModeratorProduct = order.items.some(item => 
        productIds.includes(item.productId.toString())
      );
      
      if (!hasModeratorProduct) {
        throw new ForbiddenException('Vous ne pouvez voir que les commandes contenant vos produits');
      }
    } else if (!isAdmin && !isOwner) {
      // Regular user can only see their own orders
      throw new ForbiddenException('Vous ne pouvez voir que vos propres commandes');
    }

    return order;
  }

  async getAllOrders(userId?: string, userRoles?: string[]) {
    // If user is moderator (not admin), only show orders containing their products
    const isModerator = userRoles?.includes(Role.MODERATOR) && !userRoles?.includes(Role.ADMIN);
    
    if (isModerator && userId) {
      // Get all product IDs owned by this moderator
      const moderatorProducts = await this.productModel
        .find({ moderatorId: new Types.ObjectId(userId) })
        .select('_id')
        .exec();
      
      const productIds = moderatorProducts.map(p => (p._id as Types.ObjectId).toString());
      
      // Find orders that contain at least one of these products
      const allOrders = await this.orderModel
        .find()
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .exec();
      
      // Filter orders that contain moderator's products
      return allOrders.filter(order => 
        order.items.some(item => productIds.includes(item.productId.toString()))
      );
    }
    
    // Admin or no user info: show all orders
    return this.orderModel
      .find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, userId?: string, userRoles?: string[]) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    // Check if moderator can update this order
    if (userId && userRoles) {
      const isAdmin = userRoles.includes(Role.ADMIN);
      const isModerator = userRoles.includes(Role.MODERATOR) && !isAdmin;
      
      if (isModerator) {
        const moderatorProducts = await this.productModel
          .find({ moderatorId: new Types.ObjectId(userId) })
          .select('_id')
          .exec();
        
        const productIds = moderatorProducts.map(p => (p._id as Types.ObjectId).toString());
        const hasModeratorProduct = order.items.some(item => 
          productIds.includes(item.productId.toString())
        );
        
        if (!hasModeratorProduct) {
          throw new ForbiddenException('Vous ne pouvez modifier que les commandes contenant vos produits');
        }
      }
    }

    // Validate status transition
    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Impossible de modifier une commande déjà livrée');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Impossible de modifier une commande annulée');
    }

    order.status = status;
    await order.save();

    return order;
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus, userId?: string, userRoles?: string[]) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    // Check if moderator can update this order
    if (userId && userRoles) {
      const isAdmin = userRoles.includes(Role.ADMIN);
      const isModerator = userRoles.includes(Role.MODERATOR) && !isAdmin;
      
      if (isModerator) {
        const moderatorProducts = await this.productModel
          .find({ moderatorId: new Types.ObjectId(userId) })
          .select('_id')
          .exec();
        
        const productIds = moderatorProducts.map(p => (p._id as Types.ObjectId).toString());
        const hasModeratorProduct = order.items.some(item => 
          productIds.includes(item.productId.toString())
        );
        
        if (!hasModeratorProduct) {
          throw new ForbiddenException('Vous ne pouvez modifier que les commandes contenant vos produits');
        }
      }
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    return order;
  }

  async cancelOrder(orderId: string, userId: string, userRoles: string[]) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    // Check access: user can cancel their own orders, admins can cancel any
    const isAdmin = userRoles.includes('admin') || userRoles.includes('moderator');
    const isOwner = order.userId.toString() === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Vous ne pouvez annuler que vos propres commandes');
    }

    // Can only cancel before shipped
    if ([OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status)) {
      throw new BadRequestException('Impossible d\'annuler une commande déjà expédiée');
    }

    // Already cancelled
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cette commande est déjà annulée');
    }

    // Restore stock for all items - Use findByIdAndUpdate to avoid validation issues
    for (const item of order.items) {
      await this.productModel.findByIdAndUpdate(
        item.productId,
        { $inc: { quantite_en_stock: item.quantity } },
        { runValidators: false } // Skip validators to avoid issues with bad existing data
      );
    }

    // Update order status
    order.status = OrderStatus.CANCELLED;
    await order.save();

    return order;
  }
}

