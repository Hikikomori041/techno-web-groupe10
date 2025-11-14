import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../modules/categories/schemas/category.schema';
import { Product } from '../modules/products/schemas/product.schema';
import { User } from '../modules/users/schemas/user.schema';
import { Order, OrderStatus, PaymentStatus } from '../modules/orders/schemas/order.schema';
import { Role } from '../common/enums/role.enum';
import * as bcrypt from 'bcryptjs';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const categoryModel = app.get<Model<Category>>(getModelToken(Category.name));
  const productModel = app.get<Model<Product>>(getModelToken(Product.name));
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const orderModel = app.get<Model<Order>>(getModelToken(Order.name));

  console.log('🌱 Starting database seeding...\n');

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await categoryModel.deleteMany({});
    await productModel.deleteMany({});
    await orderModel.deleteMany({});
    // Don't delete users to avoid breaking authentication
    // await userModel.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // 1. Seed Categories
    console.log('📁 Creating categories...');
    const categories = [
      { name: 'Laptops', description: 'High-performance laptops for work and gaming', isActive: true },
      { name: 'Smartphones', description: 'Latest smartphones with cutting-edge technology', isActive: true },
      { name: 'Accessories', description: 'Tech accessories and peripherals', isActive: true },
      { name: 'Monitors', description: 'High-resolution monitors for professionals', isActive: true },
      { name: 'Tablets', description: 'Portable tablets for productivity and entertainment', isActive: true },
      { name: 'Headphones', description: 'Premium audio headphones and earbuds', isActive: true },
    ];

    const createdCategories = await categoryModel.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories\n`);

    // 2. Seed Users (if they don't exist)
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const usersData = [
      {
        email: 'admin@achetez.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        roles: [Role.ADMIN],
        provider: 'local',
      },
      {
        email: 'moderator@achetez.com',
        password: hashedPassword,
        firstName: 'Moderator',
        lastName: 'User',
        roles: [Role.MODERATOR],
        provider: 'local',
      },
      {
        email: 'user1@achetez.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        roles: [Role.USER],
        provider: 'local',
      },
      {
        email: 'user2@achetez.com',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        roles: [Role.USER],
        provider: 'local',
      },
    ];

    const createdUsers: User[] = [];
    for (const userData of usersData) {
      const existingUser = await userModel.findOne({ email: userData.email });
      if (!existingUser) {
        const user = await userModel.create(userData);
        createdUsers.push(user);
        console.log(`   ✅ Created user: ${userData.email}`);
      } else {
        createdUsers.push(existingUser);
        console.log(`   ⏭️  User already exists: ${userData.email}`);
      }
    }
    console.log(`✅ Processed ${usersData.length} users\n`);

    // Get category IDs
    const laptopsCategory = createdCategories.find(c => c.name === 'Laptops');
    const smartphonesCategory = createdCategories.find(c => c.name === 'Smartphones');
    const accessoriesCategory = createdCategories.find(c => c.name === 'Accessories');
    const monitorsCategory = createdCategories.find(c => c.name === 'Monitors');
    const tabletsCategory = createdCategories.find(c => c.name === 'Tablets');
    const headphonesCategory = createdCategories.find(c => c.name === 'Headphones');

    // Validate categories exist
    if (!laptopsCategory || !smartphonesCategory || !accessoriesCategory || 
        !monitorsCategory || !tabletsCategory || !headphonesCategory) {
      throw new Error('Failed to find required categories');
    }

    // 3. Seed Products
    console.log('📦 Creating products...');
    const products = [
      // Laptops
      {
        nom: 'MacBook Pro 16"',
        prix: 2499,
        description: 'Powerful laptop with M3 Pro chip, perfect for professionals and creatives. Features 16-inch Retina display, 32GB RAM, and 1TB SSD.',
        images: ['/macbook-pro-laptop.jpeg'],
        specifications: [
          { key: 'Processor', value: 'M3 Pro' },
          { key: 'RAM', value: '32GB' },
          { key: 'Storage', value: '1TB SSD' },
          { key: 'Display', value: '16" Retina' },
        ],
        categoryId: laptopsCategory._id,
        quantite_en_stock: 15,
        date_de_creation: new Date(),
      },
      {
        nom: 'Dell XPS 15',
        prix: 1899,
        description: 'Premium Windows laptop with Intel i7 processor and 4K display. Ideal for content creators and professionals.',
        images: ['/computer-monitor-display.jpg'],
        specifications: [
          { key: 'Processor', value: 'Intel i7-13700H' },
          { key: 'RAM', value: '16GB' },
          { key: 'Storage', value: '512GB SSD' },
          { key: 'Display', value: '15.6" 4K OLED' },
        ],
        categoryId: laptopsCategory._id,
        quantite_en_stock: 25,
        date_de_creation: new Date(),
      },
      {
        nom: 'HP Spectre x360',
        prix: 1299,
        description: 'Convertible 2-in-1 laptop with touchscreen. Perfect for both work and entertainment.',
        images: ['/computer-monitor-display.jpg'],
        specifications: [
          { key: 'Processor', value: 'Intel i5-13500U' },
          { key: 'RAM', value: '16GB' },
          { key: 'Storage', value: '512GB SSD' },
          { key: 'Display', value: '13.5" Touch' },
        ],
        categoryId: laptopsCategory._id,
        quantite_en_stock: 30,
        date_de_creation: new Date(),
      },
      // Smartphones
      {
        nom: 'iPhone 15 Pro',
        prix: 999,
        description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system. The ultimate smartphone experience.',
        images: ['/modern-smartphone.jpeg'],
        specifications: [
          { key: 'Display', value: '6.1" Super Retina XDR' },
          { key: 'Chip', value: 'A17 Pro' },
          { key: 'Camera', value: '48MP Main' },
          { key: 'Storage', value: '128GB' },
        ],
        categoryId: smartphonesCategory._id,
        quantite_en_stock: 50,
        date_de_creation: new Date(),
      },
      {
        nom: 'Samsung Galaxy S24 Ultra',
        prix: 1199,
        description: 'Flagship Android phone with S Pen, 200MP camera, and Snapdragon 8 Gen 3 processor.',
        images: ['/modern-smartphone.jpeg'],
        specifications: [
          { key: 'Display', value: '6.8" Dynamic AMOLED' },
          { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
          { key: 'Camera', value: '200MP Main' },
          { key: 'Storage', value: '256GB' },
        ],
        categoryId: smartphonesCategory._id,
        quantite_en_stock: 40,
        date_de_creation: new Date(),
      },
      {
        nom: 'Google Pixel 8 Pro',
        prix: 899,
        description: 'Pure Android experience with Google AI features and exceptional camera quality.',
        images: ['/modern-smartphone.jpeg'],
        specifications: [
          { key: 'Display', value: '6.7" LTPO OLED' },
          { key: 'Processor', value: 'Google Tensor G3' },
          { key: 'Camera', value: '50MP Main' },
          { key: 'Storage', value: '128GB' },
        ],
        categoryId: smartphonesCategory._id,
        quantite_en_stock: 35,
        date_de_creation: new Date(),
      },
      // Accessories
      {
        nom: 'Wireless Mouse Logitech MX Master 3',
        prix: 99,
        description: 'Premium wireless mouse with ergonomic design and advanced tracking. Perfect for productivity.',
        images: ['/computer-monitor-display.jpg'],
        specifications: [
          { key: 'Connectivity', value: 'Bluetooth & USB' },
          { key: 'Battery', value: '70 days' },
          { key: 'DPI', value: '4000' },
        ],
        categoryId: accessoriesCategory._id,
        quantite_en_stock: 100,
        date_de_creation: new Date(),
      },
      {
        nom: 'Mechanical Keyboard Keychron K8',
        prix: 149,
        description: 'Wireless mechanical keyboard with hot-swappable switches and RGB backlighting.',
        images: ['/computer-monitor-display.jpg'],
        specifications: [
          { key: 'Switches', value: 'Gateron Brown' },
          { key: 'Connectivity', value: 'Bluetooth & USB-C' },
          { key: 'Layout', value: '87 keys' },
        ],
        categoryId: accessoriesCategory._id,
        quantite_en_stock: 75,
        date_de_creation: new Date(),
      },
      // Monitors
      {
        nom: 'Dell UltraSharp 27" 4K',
        prix: 549,
        description: 'Professional 4K monitor with USB-C connectivity and color-accurate display. Perfect for designers and content creators.',
        images: ['/computer-monitor-display.jpg'],
        specifications: [
          { key: 'Resolution', value: '3840x2160' },
          { key: 'Refresh Rate', value: '60Hz' },
          { key: 'Panel Type', value: 'IPS' },
          { key: 'Connectivity', value: 'USB-C, HDMI, DisplayPort' },
        ],
        categoryId: monitorsCategory._id,
        quantite_en_stock: 20,
        date_de_creation: new Date(),
      },
      {
        nom: 'LG UltraGear 27" 144Hz',
        prix: 399,
        description: 'Gaming monitor with high refresh rate and low latency. Perfect for competitive gaming.',
        images: ['/computer-monitor-display.jpg'],
        specifications: [
          { key: 'Resolution', value: '2560x1440' },
          { key: 'Refresh Rate', value: '144Hz' },
          { key: 'Panel Type', value: 'IPS' },
          { key: 'Response Time', value: '1ms' },
        ],
        categoryId: monitorsCategory._id,
        quantite_en_stock: 30,
        date_de_creation: new Date(),
      },
      // Tablets
      {
        nom: 'iPad Pro 12.9"',
        prix: 1099,
        description: 'Powerful tablet with M2 chip and Liquid Retina XDR display. Perfect for creative professionals.',
        images: ['/computer-monitor-display.jpg'],
        specifications: [
          { key: 'Chip', value: 'M2' },
          { key: 'Display', value: '12.9" Liquid Retina XDR' },
          { key: 'Storage', value: '128GB' },
          { key: 'Connectivity', value: 'Wi-Fi + Cellular' },
        ],
        categoryId: tabletsCategory._id,
        quantite_en_stock: 25,
        date_de_creation: new Date(),
      },
      // Headphones
      {
        nom: 'Sony WH-1000XM5',
        prix: 399,
        description: 'Premium noise-cancelling headphones with exceptional sound quality and 30-hour battery life.',
        images: ['/wireless-headphones.jpg'],
        specifications: [
          { key: 'Type', value: 'Over-ear' },
          { key: 'Battery', value: '30 hours' },
          { key: 'Connectivity', value: 'Bluetooth 5.2' },
          { key: 'Noise Cancelling', value: 'Yes' },
        ],
        categoryId: headphonesCategory._id,
        quantite_en_stock: 60,
        date_de_creation: new Date(),
      },
      {
        nom: 'AirPods Pro 2',
        prix: 249,
        description: 'Apple\'s premium wireless earbuds with active noise cancellation and spatial audio.',
        images: ['/wireless-headphones.jpg'],
        specifications: [
          { key: 'Type', value: 'In-ear' },
          { key: 'Battery', value: '6 hours + 24h case' },
          { key: 'Connectivity', value: 'Bluetooth 5.3' },
          { key: 'Noise Cancelling', value: 'Yes' },
        ],
        categoryId: headphonesCategory._id,
        quantite_en_stock: 80,
        date_de_creation: new Date(),
      },
    ];

    const createdProducts = await productModel.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products\n`);

    // Assign some products to moderator
    const moderatorUser = createdUsers.find(u => u.email === 'moderator@achetez.com');
    let moderatorProductIds: any[] = [];
    if (moderatorUser) {
      console.log('👤 Assigning products to moderator...');
      // Assign about 40% of products to moderator for good stats (first 5 products)
      const productsToAssign = createdProducts.slice(0, Math.min(5, createdProducts.length));
      moderatorProductIds = productsToAssign.map(p => p._id);
      await productModel.updateMany(
        { _id: { $in: moderatorProductIds } },
        { $set: { moderatorId: moderatorUser._id } }
      );
      console.log(`✅ Assigned ${productsToAssign.length} products to moderator\n`);
    }

    // 4. Seed Orders
    console.log('📋 Creating orders...');
    const adminUser = createdUsers.find(u => u.email === 'admin@achetez.com');
    const user1 = createdUsers.find(u => u.email === 'user1@achetez.com');
    const user2 = createdUsers.find(u => u.email === 'user2@achetez.com');

    let createdOrders: Order[] = [];

    if (adminUser && user1 && user2 && createdProducts.length > 0) {
      const baseTimestamp = Date.now();
      const moderatorUser = createdUsers.find(u => u.email === 'moderator@achetez.com');
      
      // Get moderator products (first 5 products that were assigned)
      const moderatorProducts = moderatorProductIds.length > 0
        ? createdProducts.filter((p: any) => moderatorProductIds.some(id => id.toString() === p._id.toString()))
        : [];
      
      // Generate orders spread across last 30 days for better graph visualization
      const generateDate = (daysAgo: number) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        date.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0, 0);
        return date;
      };

      // Helper to get moderator product or fallback to any product
      const getModeratorProduct = (index: number) => {
        if (moderatorProducts.length > 0 && index < moderatorProducts.length) {
          return moderatorProducts[index];
        }
        // Fallback to first few products if moderator has no products yet
        return createdProducts[Math.min(index, createdProducts.length - 1)];
      };

      const orders = [
        // Orders with moderator products - spread across last 30 days for good graph
        {
          userId: user1._id,
          orderNumber: `ORD-${baseTimestamp}-001`,
          items: [
            {
              productId: getModeratorProduct(0)._id,
              productName: getModeratorProduct(0).nom,
              productPrice: getModeratorProduct(0).prix,
              quantity: 1,
              subtotal: getModeratorProduct(0).prix,
            },
            {
              productId: getModeratorProduct(1)?._id || createdProducts[3]._id,
              productName: getModeratorProduct(1)?.nom || createdProducts[3].nom,
              productPrice: getModeratorProduct(1)?.prix || createdProducts[3].prix,
              quantity: 1,
              subtotal: getModeratorProduct(1)?.prix || createdProducts[3].prix,
            },
          ],
          total: (getModeratorProduct(0).prix + (getModeratorProduct(1)?.prix || createdProducts[3].prix)),
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            street: '123 Main Street',
            city: 'New York',
            postalCode: '10001',
            country: 'USA',
          },
          createdAt: generateDate(28), // 28 days ago
        },
        {
          userId: user1._id,
          orderNumber: `ORD-${baseTimestamp}-002`,
          items: [
            {
              productId: getModeratorProduct(2)?._id || createdProducts[9]._id,
              productName: getModeratorProduct(2)?.nom || createdProducts[9].nom,
              productPrice: getModeratorProduct(2)?.prix || createdProducts[9].prix,
              quantity: 2,
              subtotal: (getModeratorProduct(2)?.prix || createdProducts[9].prix) * 2,
            },
          ],
          total: (getModeratorProduct(2)?.prix || createdProducts[9].prix) * 2,
          status: OrderStatus.SHIPPED,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            street: '123 Main Street',
            city: 'New York',
            postalCode: '10001',
            country: 'USA',
          },
          createdAt: generateDate(25), // 25 days ago
        },
        {
          userId: user2._id,
          orderNumber: `ORD-${baseTimestamp}-003`,
          items: [
            {
              productId: getModeratorProduct(0)._id,
              productName: getModeratorProduct(0).nom,
              productPrice: getModeratorProduct(0).prix,
              quantity: 1,
              subtotal: getModeratorProduct(0).prix,
            },
            {
              productId: getModeratorProduct(3)?._id || createdProducts[10]._id,
              productName: getModeratorProduct(3)?.nom || createdProducts[10].nom,
              productPrice: getModeratorProduct(3)?.prix || createdProducts[10].prix,
              quantity: 1,
              subtotal: getModeratorProduct(3)?.prix || createdProducts[10].prix,
            },
          ],
          total: getModeratorProduct(0).prix + (getModeratorProduct(3)?.prix || createdProducts[10].prix),
          status: OrderStatus.PREPARATION,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            street: '456 Oak Avenue',
            city: 'Los Angeles',
            postalCode: '90001',
            country: 'USA',
          },
          createdAt: generateDate(20), // 20 days ago
        },
        {
          userId: user2._id,
          orderNumber: `ORD-${baseTimestamp}-004`,
          items: [
            {
              productId: getModeratorProduct(1)?._id || createdProducts[7]._id,
              productName: getModeratorProduct(1)?.nom || createdProducts[7].nom,
              productPrice: getModeratorProduct(1)?.prix || createdProducts[7].prix,
              quantity: 1,
              subtotal: getModeratorProduct(1)?.prix || createdProducts[7].prix,
            },
          ],
          total: getModeratorProduct(1)?.prix || createdProducts[7].prix,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          shippingAddress: {
            street: '456 Oak Avenue',
            city: 'Los Angeles',
            postalCode: '90001',
            country: 'USA',
          },
          createdAt: generateDate(15), // 15 days ago
        },
        {
          userId: user1._id,
          orderNumber: `ORD-${baseTimestamp}-005`,
          items: [
            {
              productId: getModeratorProduct(0)._id,
              productName: getModeratorProduct(0).nom,
              productPrice: getModeratorProduct(0).prix,
              quantity: 1,
              subtotal: getModeratorProduct(0).prix,
            },
            {
              productId: getModeratorProduct(2)?._id || createdProducts[8]._id,
              productName: getModeratorProduct(2)?.nom || createdProducts[8].nom,
              productPrice: getModeratorProduct(2)?.prix || createdProducts[8].prix,
              quantity: 1,
              subtotal: getModeratorProduct(2)?.prix || createdProducts[8].prix,
            },
          ],
          total: getModeratorProduct(0).prix + (getModeratorProduct(2)?.prix || createdProducts[8].prix),
          status: OrderStatus.PAYMENT_CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            street: '123 Main Street',
            city: 'New York',
            postalCode: '10001',
            country: 'USA',
          },
          createdAt: generateDate(12), // 12 days ago
        },
        // Add more orders with moderator products for better graph visualization
        {
          userId: user1._id,
          orderNumber: `ORD-${baseTimestamp}-006`,
          items: [
            {
              productId: getModeratorProduct(1)?._id || createdProducts[4]._id,
              productName: getModeratorProduct(1)?.nom || createdProducts[4].nom,
              productPrice: getModeratorProduct(1)?.prix || createdProducts[4].prix,
              quantity: 1,
              subtotal: getModeratorProduct(1)?.prix || createdProducts[4].prix,
            },
          ],
          total: getModeratorProduct(1)?.prix || createdProducts[4].prix,
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            street: '123 Main Street',
            city: 'New York',
            postalCode: '10001',
            country: 'USA',
          },
          createdAt: generateDate(10), // 10 days ago
        },
        {
          userId: user2._id,
          orderNumber: `ORD-${baseTimestamp}-007`,
          items: [
            {
              productId: getModeratorProduct(0)._id,
              productName: getModeratorProduct(0).nom,
              productPrice: getModeratorProduct(0).prix,
              quantity: 2,
              subtotal: getModeratorProduct(0).prix * 2,
            },
          ],
          total: getModeratorProduct(0).prix * 2,
          status: OrderStatus.SHIPPED,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            street: '456 Oak Avenue',
            city: 'Los Angeles',
            postalCode: '90001',
            country: 'USA',
          },
          createdAt: generateDate(7), // 7 days ago
        },
        {
          userId: user1._id,
          orderNumber: `ORD-${baseTimestamp}-008`,
          items: [
            {
              productId: getModeratorProduct(2)?._id || createdProducts[5]._id,
              productName: getModeratorProduct(2)?.nom || createdProducts[5].nom,
              productPrice: getModeratorProduct(2)?.prix || createdProducts[5].prix,
              quantity: 1,
              subtotal: getModeratorProduct(2)?.prix || createdProducts[5].prix,
            },
            {
              productId: getModeratorProduct(3)?._id || createdProducts[6]._id,
              productName: getModeratorProduct(3)?.nom || createdProducts[6].nom,
              productPrice: getModeratorProduct(3)?.prix || createdProducts[6].prix,
              quantity: 1,
              subtotal: getModeratorProduct(3)?.prix || createdProducts[6].prix,
            },
          ],
          total: (getModeratorProduct(2)?.prix || createdProducts[5].prix) + (getModeratorProduct(3)?.prix || createdProducts[6].prix),
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            street: '123 Main Street',
            city: 'New York',
            postalCode: '10001',
            country: 'USA',
          },
          createdAt: generateDate(5), // 5 days ago
        },
        {
          userId: user2._id,
          orderNumber: `ORD-${baseTimestamp}-009`,
          items: [
            {
              productId: getModeratorProduct(0)._id,
              productName: getModeratorProduct(0).nom,
              productPrice: getModeratorProduct(0).prix,
              quantity: 1,
              subtotal: getModeratorProduct(0).prix,
            },
          ],
          total: getModeratorProduct(0).prix,
          status: OrderStatus.PAYMENT_CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            street: '456 Oak Avenue',
            city: 'Los Angeles',
            postalCode: '90001',
            country: 'USA',
          },
          createdAt: generateDate(3), // 3 days ago
        },
        {
          userId: user1._id,
          orderNumber: `ORD-${baseTimestamp}-010`,
          items: [
            {
              productId: getModeratorProduct(1)?._id || createdProducts[9]._id,
              productName: getModeratorProduct(1)?.nom || createdProducts[9].nom,
              productPrice: getModeratorProduct(1)?.prix || createdProducts[9].prix,
              quantity: 1,
              subtotal: getModeratorProduct(1)?.prix || createdProducts[9].prix,
            },
          ],
          total: getModeratorProduct(1)?.prix || createdProducts[9].prix,
          status: OrderStatus.PREPARATION,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            street: '123 Main Street',
            city: 'New York',
            postalCode: '10001',
            country: 'USA',
          },
          createdAt: generateDate(1), // 1 day ago
        },
        {
          userId: user2._id,
          orderNumber: `ORD-${baseTimestamp}-011`,
          items: [
            {
              productId: getModeratorProduct(0)._id,
              productName: getModeratorProduct(0).nom,
              productPrice: getModeratorProduct(0).prix,
              quantity: 1,
              subtotal: getModeratorProduct(0).prix,
            },
            {
              productId: getModeratorProduct(2)?._id || createdProducts[10]._id,
              productName: getModeratorProduct(2)?.nom || createdProducts[10].nom,
              productPrice: getModeratorProduct(2)?.prix || createdProducts[10].prix,
              quantity: 1,
              subtotal: getModeratorProduct(2)?.prix || createdProducts[10].prix,
            },
          ],
          total: getModeratorProduct(0).prix + (getModeratorProduct(2)?.prix || createdProducts[10].prix),
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            street: '456 Oak Avenue',
            city: 'Los Angeles',
            postalCode: '90001',
            country: 'USA',
          },
          createdAt: generateDate(0), // Today
        },
        // Additional orders for better graph coverage
        {
          userId: user1._id,
          orderNumber: `ORD-${baseTimestamp}-012`,
          items: [
            {
              productId: getModeratorProduct(0)._id,
              productName: getModeratorProduct(0).nom,
              productPrice: getModeratorProduct(0).prix,
              quantity: 1,
              subtotal: getModeratorProduct(0).prix,
            },
          ],
          total: getModeratorProduct(0).prix,
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            street: '123 Main Street',
            city: 'New York',
            postalCode: '10001',
            country: 'USA',
          },
          createdAt: generateDate(22), // 22 days ago
        },
        {
          userId: user2._id,
          orderNumber: `ORD-${baseTimestamp}-013`,
          items: [
            {
              productId: getModeratorProduct(1)?._id || createdProducts[1]._id,
              productName: getModeratorProduct(1)?.nom || createdProducts[1].nom,
              productPrice: getModeratorProduct(1)?.prix || createdProducts[1].prix,
              quantity: 1,
              subtotal: getModeratorProduct(1)?.prix || createdProducts[1].prix,
            },
          ],
          total: getModeratorProduct(1)?.prix || createdProducts[1].prix,
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            street: '456 Oak Avenue',
            city: 'Los Angeles',
            postalCode: '90001',
            country: 'USA',
          },
          createdAt: generateDate(18), // 18 days ago
        },
        {
          userId: user1._id,
          orderNumber: `ORD-${baseTimestamp}-014`,
          items: [
            {
              productId: getModeratorProduct(2)?._id || createdProducts[2]._id,
              productName: getModeratorProduct(2)?.nom || createdProducts[2].nom,
              productPrice: getModeratorProduct(2)?.prix || createdProducts[2].prix,
              quantity: 1,
              subtotal: getModeratorProduct(2)?.prix || createdProducts[2].prix,
            },
          ],
          total: getModeratorProduct(2)?.prix || createdProducts[2].prix,
          status: OrderStatus.SHIPPED,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            street: '123 Main Street',
            city: 'New York',
            postalCode: '10001',
            country: 'USA',
          },
          createdAt: generateDate(14), // 14 days ago
        },
        {
          userId: user2._id,
          orderNumber: `ORD-${baseTimestamp}-015`,
          items: [
            {
              productId: getModeratorProduct(0)._id,
              productName: getModeratorProduct(0).nom,
              productPrice: getModeratorProduct(0).prix,
              quantity: 1,
              subtotal: getModeratorProduct(0).prix,
            },
            {
              productId: getModeratorProduct(1)?._id || createdProducts[3]._id,
              productName: getModeratorProduct(1)?.nom || createdProducts[3].nom,
              productPrice: getModeratorProduct(1)?.prix || createdProducts[3].prix,
              quantity: 1,
              subtotal: getModeratorProduct(1)?.prix || createdProducts[3].prix,
            },
          ],
          total: getModeratorProduct(0).prix + (getModeratorProduct(1)?.prix || createdProducts[3].prix),
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            street: '456 Oak Avenue',
            city: 'Los Angeles',
            postalCode: '90001',
            country: 'USA',
          },
          createdAt: generateDate(8), // 8 days ago
        },
        {
          userId: user1._id,
          orderNumber: `ORD-${baseTimestamp}-016`,
          items: [
            {
              productId: getModeratorProduct(3)?._id || createdProducts[4]._id,
              productName: getModeratorProduct(3)?.nom || createdProducts[4].nom,
              productPrice: getModeratorProduct(3)?.prix || createdProducts[4].prix,
              quantity: 1,
              subtotal: getModeratorProduct(3)?.prix || createdProducts[4].prix,
            },
          ],
          total: getModeratorProduct(3)?.prix || createdProducts[4].prix,
          status: OrderStatus.PAYMENT_CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            street: '123 Main Street',
            city: 'New York',
            postalCode: '10001',
            country: 'USA',
          },
          createdAt: generateDate(4), // 4 days ago
        },
        {
          userId: user2._id,
          orderNumber: `ORD-${baseTimestamp}-017`,
          items: [
            {
              productId: getModeratorProduct(0)._id,
              productName: getModeratorProduct(0).nom,
              productPrice: getModeratorProduct(0).prix,
              quantity: 1,
              subtotal: getModeratorProduct(0).prix,
            },
          ],
          total: getModeratorProduct(0).prix,
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            street: '456 Oak Avenue',
            city: 'Los Angeles',
            postalCode: '90001',
            country: 'USA',
          },
          createdAt: generateDate(2), // 2 days ago
        },
      ];

      createdOrders = await orderModel.insertMany(orders) as any;
      console.log(`✅ Created ${createdOrders.length} orders\n`);
    } else {
      console.log('⚠️  Skipping orders creation - missing users or products\n');
    }

    console.log('✨ Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Users: ${usersData.length}`);
    console.log(`   - Orders: ${createdOrders.length}\n`);
    console.log('🔑 Test Credentials:');
    console.log('   Admin: admin@achetez.com / password123');
    console.log('   Moderator: moderator@achetez.com / password123');
    console.log('   User: user1@achetez.com / password123');
    console.log('   User: user2@achetez.com / password123\n');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the seed
seed()
  .then(() => {
    console.log('✅ Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });

