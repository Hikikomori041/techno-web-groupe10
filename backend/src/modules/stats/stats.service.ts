import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderStatus } from '../orders/schemas/order.schema';
import { Product } from '../products/schemas/product.schema';
import { User } from '../users/schemas/user.schema';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getDashboardStats(userId?: string, userRoles?: string[]) {
    const isAdmin = userRoles?.some(role => role.toLowerCase() === Role.ADMIN.toLowerCase());
    const isModerator = userRoles?.some(role => role.toLowerCase() === Role.MODERATOR.toLowerCase());
    const shouldFilter = isModerator && !isAdmin && userId;
    
    this.logger.debug('Stats filter applied', {
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
      this.logger.debug(`Moderator ${userId} owns ${allProducts.length} products`);
    } else {
      allProducts = await this.productModel.find().exec();
      this.logger.debug(`Admin viewing all ${allProducts.length} products`);
    }
    
    // Get all orders
    let allOrders = await this.orderModel.find().exec();
    const totalOrdersBeforeFilter = allOrders.length;
    
    // Filter orders for moderators (only orders containing their products)
    if (shouldFilter && productIds.length > 0) {
      allOrders = allOrders.filter(order => 
        order.items.some(item => productIds.includes(item.productId.toString()))
      );
      this.logger.debug(`Filtered ${totalOrdersBeforeFilter} orders to ${allOrders.length} containing moderator products`);
    } else if (shouldFilter && productIds.length === 0) {
      // Moderator has no products, show empty stats
      allOrders = [];
      this.logger.debug(`Moderator has no products, showing 0 orders`);
    } else {
      this.logger.debug(`Admin viewing all ${allOrders.length} orders`);
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
    
    this.logger.debug(
      `Revenue calculated`,
      {
        total: totalRevenue.toFixed(2),
        month: monthlyRevenue.toFixed(2),
        today: todayRevenue.toFixed(2),
      },
    );
    
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
      this.logger.debug(`Admin viewing user stats: ${totalUsers} total users`);
    } else {
      this.logger.debug(`Moderator - user stats hidden`);
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
    
    this.logger.debug(`Top products calculated`, { count: topProducts.length, totalSold: totalQuantitySold });
    
    // Revenue by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    
    const recentOrders = completedOrders.filter(order => {
      const orderDate = (order as any).createdAt ? new Date((order as any).createdAt) : null;
      return orderDate && orderDate >= thirtyDaysAgo;
    });
    
    this.logger.debug(`Filtered ${recentOrders.length} recent orders for revenue by day calculation`);
    
    const revenueByDay = new Map<string, { date: string; revenue: number; orders: number }>();
    
    recentOrders.forEach(order => {
      const orderDate = (order as any).createdAt ? new Date((order as any).createdAt) : new Date();
      const dateStr = orderDate.toISOString().split('T')[0];
      const current = revenueByDay.get(dateStr) || { date: dateStr, revenue: 0, orders: 0 };
      const orderRevenue = calculateOrderRevenue(order);
      
      if (orderRevenue > 0) {
        revenueByDay.set(dateStr, {
          date: dateStr,
          revenue: current.revenue + orderRevenue,
          orders: current.orders + 1,
        });
      }
    });
    
    const revenueByDayArray = Array.from(revenueByDay.values())
      .sort((a, b) => a.date.localeCompare(b.date));
    
    this.logger.debug(`Revenue by day calculated for last 30 days`, { 
      daysWithData: revenueByDayArray.length,
      totalRevenue: revenueByDayArray.reduce((sum, day) => sum + day.revenue, 0),
      sampleDays: revenueByDayArray.slice(0, 3).map(d => ({ date: d.date, revenue: d.revenue }))
    });
    
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

