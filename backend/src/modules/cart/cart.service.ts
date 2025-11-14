import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from './schemas/cart.schema';
import { ProductsService } from '../products/services/products.service';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private productsService: ProductsService,
  ) {}

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    this.logger.debug(`addToCart called`, { userId, productId, quantity });
    
    // Validate product exists
    const product = await this.productsService.findOne(productId);
    if (!product) {
      this.logger.error(`Product not found: ${productId}`);
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    
    this.logger.debug(`Product found: ${product.nom}`);

    // Check stock
    if (product.quantite_en_stock < quantity) {
      this.logger.warn(
        `Insufficient stock for product ${productId} (available: ${product.quantite_en_stock}, requested: ${quantity})`,
      );
      throw new BadRequestException(`Insufficient stock. Only ${product.quantite_en_stock} available`);
    }

    // Check if item already exists in cart
    const existingItem = await this.cartModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });

    if (existingItem) {
      this.logger.debug('Item already in cart, updating quantity');
      // Update quantity by adding to existing
      existingItem.quantity += quantity;
      await existingItem.save();
      
      // Populate and return
      const result = await this.cartModel
        .findById(existingItem._id)
        .populate('productId')
        .exec();
      
      this.logger.debug('Cart updated successfully');
      return result;
    }

    this.logger.debug('Creating new cart item');
    // Create new cart item
    const cartItem = new this.cartModel({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
      quantity,
    });

    await cartItem.save();
    this.logger.debug('Cart item saved');
    
    // Populate and return
    const result = await this.cartModel
      .findById(cartItem._id)
      .populate('productId')
      .exec();
    
    this.logger.debug('Cart item created successfully');
    return result;
  }

  async getCart(userId: string) {
    try {
      // Validate userId
      if (!userId || typeof userId !== 'string') {
        this.logger.error(`Invalid userId provided: ${userId}`);
        throw new BadRequestException('Invalid user ID');
      }

      // Validate ObjectId format
      if (!Types.ObjectId.isValid(userId)) {
        this.logger.error(`Invalid ObjectId format for userId: ${userId}`);
        throw new BadRequestException('Invalid user ID format');
      }

      const userObjectId = new Types.ObjectId(userId);
      
      const items = await this.cartModel
        .find({ userId: userObjectId })
        .populate('productId')
        .sort({ addedAt: -1 })
        .exec();

      // Filter out items with deleted products and calculate totals
      let total = 0;
      let itemCount = 0;
      const itemsWithSubtotal: any[] = [];
      const itemsToRemove: any[] = [];

      for (const item of items) {
        try {
          const product = item.productId as any;
          
          // Skip items where product was deleted
          if (!product || !product._id) {
            this.logger.warn(`Cart item ${item._id} references deleted product, will be removed`);
            itemsToRemove.push(item._id);
            continue;
          }

          // Validate product has required fields
          if (typeof product.prix !== 'number' || isNaN(product.prix)) {
            this.logger.warn(`Cart item ${item._id} has invalid product price: ${product.prix}, will be removed`);
            itemsToRemove.push(item._id);
            continue;
          }

          // Validate quantity
          if (typeof item.quantity !== 'number' || item.quantity <= 0) {
            this.logger.warn(`Cart item ${item._id} has invalid quantity: ${item.quantity}, will be removed`);
            itemsToRemove.push(item._id);
            continue;
          }

          const subtotal = product.prix * item.quantity;
          total += subtotal;
          itemCount += item.quantity;

          itemsWithSubtotal.push({
            _id: item._id,
            productId: product,
            quantity: item.quantity,
            subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimals
            addedAt: item.addedAt,
          });
        } catch (itemError) {
          this.logger.error(`Error processing cart item ${item._id}: ${itemError.message}`);
          itemsToRemove.push(item._id);
        }
      }

      // Remove invalid cart items in background (don't block response)
      if (itemsToRemove.length > 0) {
        this.cartModel.deleteMany({ _id: { $in: itemsToRemove } }).exec().catch(err => {
          this.logger.error(`Failed to remove invalid cart items: ${err.message}`);
        });
      }

      return {
        items: itemsWithSubtotal,
        total: Math.round(total * 100) / 100, // Round to 2 decimals
        itemCount,
      };
    } catch (error) {
      this.logger.error(`Error getting cart for user ${userId}: ${error.message}`, error.stack);
      // Re-throw known exceptions, wrap others
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve cart: ${error.message}`);
    }
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
    try {
      // Validate userId
      if (!userId || typeof userId !== 'string') {
        this.logger.error(`Invalid userId provided to clearCart: ${userId}`);
        throw new BadRequestException('Invalid user ID');
      }

      // Validate ObjectId format
      if (!Types.ObjectId.isValid(userId)) {
        this.logger.error(`Invalid ObjectId format for userId: ${userId}`);
        throw new BadRequestException('Invalid user ID format');
      }

      const userObjectId = new Types.ObjectId(userId);
      const result = await this.cartModel.deleteMany({
        userId: userObjectId,
      });

      this.logger.debug(`Cart cleared for user ${userId}, deleted ${result.deletedCount} items`);

      return {
        message: 'Cart cleared successfully',
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      this.logger.error(`Error clearing cart for user ${userId}: ${error.message}`, error.stack);
      // Re-throw known exceptions
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to clear cart: ${error.message}`);
    }
  }
}

