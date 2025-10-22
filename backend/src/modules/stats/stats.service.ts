import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderStatus } from '../orders/schemas/order.schema';
import { Product } from '../products/schemas/product.schema';
import { User } from '../users/schemas/user.schema';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getDashboardStats(userId?: string, userRoles?: string[]) {
    const isAdmin = userRoles?.some(role => role.toLowerCase() === Role.ADMIN.toLowerCase());
    const isModerator = userRoles?.some(role => role.toLowerCase() === Role.MODERATOR.toLowerCase());
    const shouldFilter = isModerator && !isAdmin && userId;
    
    console.log('📊 Stats Filter Debug:', {
      userId,
      userRoles,
      isAdmin,
      isModerator,
      shouldFilter,
    });
    
    // Get products (filtered for moderators)
    let allProducts: any[];
    let productIds: string[] = [];
    
    if (shouldFilter) {
      allProducts = await this.productModel
        .find({ moderatorId: new Types.ObjectId(userId) })
        .exec();
      productIds = allProducts.map(p => p._id.toString());
      console.log(`🔍 Moderator ${userId} owns ${allProducts.length} products`);
    } else {
      allProducts = await this.productModel.find().exec();
      console.log(`👑 Admin viewing all ${allProducts.length} products`);
    }
    
    // Get all orders
    let allOrders = await this.orderModel.find().exec();
    const totalOrdersBeforeFilter = allOrders.length;
    
    // Filter orders for moderators (only orders containing their products)
    if (shouldFilter && productIds.length > 0) {
      allOrders = allOrders.filter(order => 
        order.items.some(item => productIds.includes(item.productId.toString()))
      );
      console.log(`📦 Filtered ${totalOrdersBeforeFilter} orders to ${allOrders.length} orders containing moderator's products`);
    } else if (shouldFilter && productIds.length === 0) {
      // Moderator has no products, show empty stats
      allOrders = [];
      console.log(`📦 Moderator has no products, showing 0 orders`);
    } else {
      console.log(`📦 Admin viewing all ${allOrders.length} orders`);
    }
    
    // Calculate revenue (only from completed/shipped/delivered orders)
    const completedStatuses = [
      OrderStatus.PAYMENT_CONFIRMED,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];
    
    const completedOrders = allOrders.filter(order => 
      completedStatuses.includes(order.status)
    );
    
    // Helper function to calculate revenue (for moderators, only their products)
    const calculateOrderRevenue = (order: any) => {
      if (!shouldFilter) {
        // Admin sees full order total
        return order.total;
      } else {
        // Moderator sees only revenue from their products
        return order.items
          .filter((item: any) => productIds.includes(item.productId.toString()))
          .reduce((sum: number, item: any) => sum + item.subtotal, 0);
      }
    };
    
    const totalRevenue = completedOrders.reduce((sum, order) => sum + calculateOrderRevenue(order), 0);
    
    // Calculate monthly revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyOrders = completedOrders.filter(order => 
      new Date((order as any).createdAt) >= startOfMonth
    );
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + calculateOrderRevenue(order), 0);
    
    // Calculate today's revenue
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const todayOrders = completedOrders.filter(order => 
      new Date((order as any).createdAt) >= startOfDay
    );
    const todayRevenue = todayOrders.reduce((sum, order) => sum + calculateOrderRevenue(order), 0);
    
    // Average order value (for moderators, average per order containing their products)
    const averageOrder = completedOrders.length > 0 
      ? totalRevenue / completedOrders.length 
      : 0;
    
    console.log(`💰 Revenue calculated - Total: €${totalRevenue.toFixed(2)}, Month: €${monthlyRevenue.toFixed(2)}, Today: €${todayRevenue.toFixed(2)}`);
    
    // Orders by status
    const ordersByStatus = {
      pending: allOrders.filter(o => o.status === OrderStatus.PENDING).length,
      preparation: allOrders.filter(o => o.status === OrderStatus.PREPARATION).length,
      payment_confirmed: allOrders.filter(o => o.status === OrderStatus.PAYMENT_CONFIRMED).length,
      shipped: allOrders.filter(o => o.status === OrderStatus.SHIPPED).length,
      delivered: allOrders.filter(o => o.status === OrderStatus.DELIVERED).length,
      cancelled: allOrders.filter(o => o.status === OrderStatus.CANCELLED).length,
    };
    
    // Products stats (already filtered for moderators)
    const totalProducts = allProducts.length;
    const inStock = allProducts.filter(p => p.quantite_en_stock > 0).length;
    const outOfStock = allProducts.filter(p => p.quantite_en_stock === 0).length;
    const lowStock = allProducts.filter(p => p.quantite_en_stock > 0 && p.quantite_en_stock <= 10).length;
    
    // Users stats (only for admins)
    let totalUsers = 0;
    let admins = 0;
    let moderators = 0;
    
    if (!shouldFilter) {
      const allUsers = await this.userModel.find().exec();
      totalUsers = allUsers.length;
      admins = allUsers.filter(u => u.roles.includes(Role.ADMIN)).length;
      moderators = allUsers.filter(u => u.roles.includes(Role.MODERATOR)).length;
      console.log(`👥 Admin viewing user stats: ${totalUsers} total users`);
    } else {
      console.log(`👥 Moderator - user stats hidden`);
    }
    
    // Calculate total quantity sold (only for moderator's products if applicable)
    let totalQuantitySold = 0;
    allOrders.forEach(order => {
      order.items.forEach(item => {
        // For moderators, only count their products
        if (!shouldFilter || productIds.includes(item.productId.toString())) {
          totalQuantitySold += item.quantity;
        }
      });
    });
    
    // Top products by revenue (only moderator's products if applicable)
    const productRevenue = new Map();
    completedOrders.forEach(order => {
      order.items.forEach(item => {
        // For moderators, only include their products
        if (!shouldFilter || productIds.includes(item.productId.toString())) {
          const key = item.productName;
          const current = productRevenue.get(key) || { quantity: 0, revenue: 0 };
          productRevenue.set(key, {
            name: item.productName,
            quantity: current.quantity + item.quantity,
            revenue: current.revenue + item.subtotal,
          });
        }
      });
    });
    
    const topProducts = Array.from(productRevenue.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    console.log(`📈 Top products calculated: ${topProducts.length} products, total sold: ${totalQuantitySold}`);
    
    // Revenue by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = completedOrders.filter(order => 
      new Date((order as any).createdAt) >= thirtyDaysAgo
    );
    
    const revenueByDay = new Map();
    recentOrders.forEach(order => {
      const date = new Date((order as any).createdAt).toISOString().split('T')[0];
      const current = revenueByDay.get(date) || { revenue: 0, orders: 0 };
      const orderRevenue = calculateOrderRevenue(order);
      revenueByDay.set(date, {
        date,
        revenue: current.revenue + orderRevenue,
        orders: current.orders + 1,
      });
    });
    
    const revenueByDayArray = Array.from(revenueByDay.values())
      .sort((a, b) => a.date.localeCompare(b.date));
    
    console.log(`📅 Revenue by day calculated for last 30 days: ${revenueByDayArray.length} days with data`);
    
    // Recent orders (last 5)
    const recentOrdersList = allOrders
      .sort((a, b) => new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime())
      .slice(0, 5)
      .map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        createdAt: (order as any).createdAt,
      }));
    
    return {
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        thisMonth: Math.round(monthlyRevenue * 100) / 100,
        today: Math.round(todayRevenue * 100) / 100,
        averageOrder: Math.round(averageOrder * 100) / 100,
      },
      orders: {
        total: allOrders.length,
        ...ordersByStatus,
      },
      products: {
        total: totalProducts,
        inStock,
        outOfStock,
        lowStock,
      },
      users: {
        total: totalUsers,
        admins,
        moderators,
      },
      sales: {
        totalQuantitySold,
        topProducts,
      },
      recentOrders: recentOrdersList,
      revenueByDay: revenueByDayArray,
    };
  }
}

