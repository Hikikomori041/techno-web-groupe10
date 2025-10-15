import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './cart.schema';
import { Order, OrderSchema } from './order/order.schema';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { OrderService } from './order/order.service';
import { OrderController } from './order/order.controller';
import { Product, ProductSchema } from '../products/product.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    AuthModule,
  ],
  controllers: [CartController, OrderController],
  providers: [CartService, OrderService],
  exports: [CartService, OrderService],
})
export class CartModule {}
