import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from './schemas/cart.schema';
import { ProductsService } from '../products/services/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private productsService: ProductsService,
  ) {}

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    // Validate product exists
    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check if item already exists in cart
    const existingItem = await this.cartModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });

    if (existingItem) {
      // Update quantity by adding to existing
      existingItem.quantity += quantity;
      await existingItem.save();
      
      // Populate and return
      return this.cartModel
        .findById(existingItem._id)
        .populate('productId')
        .exec();
    }

    // Create new cart item
    const cartItem = new this.cartModel({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
      quantity,
    });

    await cartItem.save();
    
    // Populate and return
    return this.cartModel
      .findById(cartItem._id)
      .populate('productId')
      .exec();
  }

  async getCart(userId: string) {
    const items = await this.cartModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('productId')
      .sort({ addedAt: -1 })
      .exec();

    // Calculate totals
    let total = 0;
    let itemCount = 0;

    const itemsWithSubtotal = items.map((item) => {
      const product = item.productId as any;
      const subtotal = product.prix * item.quantity;
      total += subtotal;
      itemCount += item.quantity;

      return {
        _id: item._id,
        productId: product,
        quantity: item.quantity,
        subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimals
        addedAt: item.addedAt,
      };
    });

    return {
      items: itemsWithSubtotal,
      total: Math.round(total * 100) / 100, // Round to 2 decimals
      itemCount,
    };
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    const cartItem = await this.cartModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      await this.cartModel.deleteOne({ _id: cartItem._id });
      return { message: 'Item removed from cart' };
    }

    // Update quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    // Populate and return
    return this.cartModel
      .findById(cartItem._id)
      .populate('productId')
      .exec();
  }

  async removeItem(userId: string, productId: string) {
    const result = await this.cartModel.deleteOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Cart item not found');
    }

    return { message: 'Item removed successfully' };
  }

  async clearCart(userId: string) {
    const result = await this.cartModel.deleteMany({
      userId: new Types.ObjectId(userId),
    });

    return {
      message: 'Cart cleared successfully',
      deletedCount: result.deletedCount,
    };
  }
}

