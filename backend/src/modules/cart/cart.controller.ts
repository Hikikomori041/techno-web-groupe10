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
  constructor(private readonly cartService: CartService) {}

  @Post()
  @AddToCartDocs()
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    const userId = req.user.userId;
    return this.cartService.addToCart(
      userId,
      addToCartDto.productId,
      addToCartDto.quantity || 1,
    );
  }

  @Get()
  @GetCartDocs()
  async getCart(@Request() req) {
    const userId = req.user.userId;
    return this.cartService.getCart(userId);
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

