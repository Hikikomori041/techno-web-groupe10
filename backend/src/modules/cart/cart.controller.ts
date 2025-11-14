import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import {
  AddToCartDocs,
  GetCartDocs,
  UpdateCartItemDocs,
  RemoveCartItemDocs,
  ClearCartDocs,
} from './cart.swagger';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  @Post()
  @AddToCartDocs()
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    const userId = req.user.userId;
    this.logger.debug(`addToCart request`, {
      userId,
      productId: addToCartDto.productId,
      quantity: addToCartDto.quantity,
    });
    
    try {
      const result = await this.cartService.addToCart(
        userId,
        addToCartDto.productId,
        addToCartDto.quantity || 1,
      );
      this.logger.debug('addToCart success');
      return result;
    } catch (error) {
      this.logger.error(`addToCart error: ${error.message}`);
      throw error;
    }
  }

  @Get()
  @GetCartDocs()
  async getCart(@Request() req) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        this.logger.error('getCart called without userId in request');
        throw new Error('User ID not found in request');
      }
      this.logger.debug(`getCart request for user ${userId}`);
      const result = await this.cartService.getCart(userId);
      this.logger.debug(`getCart success for user ${userId}, items: ${result.items?.length || 0}`);
      return result;
    } catch (error) {
      const userId = req.user?.userId || 'unknown';
      this.logger.error(`getCart error for user ${userId}: ${error.message}`, error.stack);
      // Ensure we throw a proper HTTP exception
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve cart: ${error.message}`);
    }
  }

  @Put(':productId')
  @UpdateCartItemDocs()
  async updateQuantity(
    @Request() req,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const userId = req.user.userId;
    return this.cartService.updateQuantity(
      userId,
      productId,
      updateCartItemDto.quantity,
    );
  }

  @Delete(':productId')
  @RemoveCartItemDocs()
  async removeItem(@Request() req, @Param('productId') productId: string) {
    const userId = req.user.userId;
    return this.cartService.removeItem(userId, productId);
  }

  @Delete()
  @ClearCartDocs()
  async clearCart(@Request() req) {
    const userId = req.user.userId;
    return this.cartService.clearCart(userId);
  }
}

