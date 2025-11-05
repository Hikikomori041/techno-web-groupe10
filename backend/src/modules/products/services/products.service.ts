import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from '../schemas/product.schema';
import { ProductStatsService } from '../stats/product-stats.service';
import { Role } from '../../../common/enums/role.enum';
import { FilterProductsDto } from '../dto/filter-products.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductsService {
  // constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly productStatsService: ProductStatsService, // 👈 injection du service
  ) {}

  async findAllWithFilters(filterDto: FilterProductsDto) {
    const {
      categoryId,
      search,
      minPrice,
      maxPrice,
      inStockOnly,
      page = 1,
      limit = 12,
      specifications,
    } = filterDto;

    console.log('🔍 Filter Products Request:', {
      categoryId,
      search,
      minPrice,
      maxPrice,
      inStockOnly,
      page,
      limit,
      specifications,
    });

    // Build query filter
    const filter: any = {};

    // Category filter
    if (categoryId) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }

    // Search by product name (case-insensitive partial match)
    if (search) {
      filter.nom = { $regex: search, $options: 'i' };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.prix = {};
      if (minPrice !== undefined) {
        filter.prix.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filter.prix.$lte = maxPrice;
      }
    }

    // Stock filter
    if (inStockOnly) {
      filter.quantite_en_stock = { $gt: 0 };
    }

    // Specifications filter - improved to handle multiple specs
    if (specifications) {
      try {
        const specsFilter = JSON.parse(specifications);
        const specsArray = Object.entries(specsFilter).map(([key, value]) => ({
          'specifications': {
            $elemMatch: { 
              key: { $regex: new RegExp(`^${key}$`, 'i') }, // Case-insensitive exact match
              value: { $regex: new RegExp(value as string, 'i') } // Case-insensitive partial match
            },
          },
        }));
        if (specsArray.length > 0) {
          if (filter.$and) {
            filter.$and.push(...specsArray);
          } else {
            filter.$and = specsArray;
          }
        }
      } catch (error) {
        console.error('Failed to parse specifications filter:', error);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categoryId', 'name description')
        .populate('moderatorId', 'firstName lastName email')
        .sort({ date_de_creation: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    console.log('✅ Filter Results:', {
      totalProducts: total,
      returnedProducts: products.length,
      page,
      totalPages,
      hasMore,
      appliedFilter: JSON.stringify(filter),
    });

    return {
      products,
      total,
      page,
      limit,
      totalPages,
      hasMore,
    };
  }

  async findAll(userId?: string, userRoles?: string[]): Promise<Product[]> {
    // If user is moderator (not admin), only show their own products
    const isAdmin = userRoles?.some(role => role.toLowerCase() === Role.ADMIN.toLowerCase());
    const isModerator = userRoles?.some(role => role.toLowerCase() === Role.MODERATOR.toLowerCase());
    
    // Moderators who are not admins should only see their own products
    const shouldFilter = isModerator && !isAdmin && userId;
    
    const filter = shouldFilter
      ? { moderatorId: new Types.ObjectId(userId) }
      : {};
    
    console.log('🔍 Products Filter Debug:', {
      userId,
      userRoles,
      isAdmin,
      isModerator,
      shouldFilter,
      filter: shouldFilter ? `moderatorId: ${userId}` : 'no filter (all products)',
    });
    
    return this.productModel
      .find(filter)
      .populate('categoryId', 'name description')
      .populate('moderatorId', 'firstName lastName email')
      .exec();
  }

  async findOne(id: string): Promise<Product | null> {
    return this.productModel
      .findById(id)
      .populate('categoryId', 'name description')
      .populate('moderatorId', 'firstName lastName email')
      .exec();
  }

  async create(productDto: CreateProductDto, userId: string): Promise<Product> {
    console.log('📦 Creating product with categoryId:', productDto.categoryId);
    
    // Validate categoryId
    if (!productDto.categoryId || productDto.categoryId === 'none' || productDto.categoryId === 'placeholder') {
      throw new Error('Invalid categoryId provided');
    }

    // Sanitize specifications to ensure correct format
    const sanitizedSpecs = this.sanitizeSpecifications(productDto.specifications);

    const newProduct = new this.productModel({
      nom: productDto.nom,
      prix: productDto.prix,
      description: productDto.description,
      images: productDto.images,
      specifications: sanitizedSpecs,
      categoryId: new Types.ObjectId(productDto.categoryId),
      moderatorId: new Types.ObjectId(userId),
      quantite_en_stock: productDto.quantite_en_stock || 0,
    });
    
    console.log('💾 Saving product with categoryId:', newProduct.categoryId);
    await newProduct.save();
    
    // Return with populated references
    const savedProduct = await this.productModel
      .findById(newProduct._id)
      .populate('categoryId', 'name description')
      .populate('moderatorId', 'firstName lastName email')
      .exec();
    
    if (!savedProduct) {
      throw new Error('Failed to retrieve saved product');
    }
    
    console.log('✅ Product created with category:', savedProduct.categoryId);
    console.log('✅ Full product data:', JSON.stringify(savedProduct, null, 2));
    
    return savedProduct;
  }

  /**
   * Sanitize specifications to ensure they are in the correct format
   * Prevents nested objects in the value field
   */
  private sanitizeSpecifications(specs?: Array<{ key: string; value: string }>): Array<{ key: string; value: string }> {
    if (!specs || !Array.isArray(specs)) {
      return [];
    }

    return specs.map(spec => {
      // If value is an object, extract the actual value
      let value = spec.value;
      if (typeof value === 'object' && value !== null) {
        value = (value as any).value || String(value);
      }
      
      return {
        key: String(spec.key),
        value: String(value),
      };
    });
  }

  async update(id: string, productDto: UpdateProductDto, userId: string, userRoles: string[]): Promise<Product | null> {
    console.log('✏️ Updating product with data:', { id, categoryId: productDto.categoryId, ...productDto });
    
    const existingProduct = await this.productModel.findById(id).exec();
    if (!existingProduct) {
      throw new NotFoundException(`Produit avec l'id ${id} introuvable`);
    }

    // Check ownership: admin can update any product, moderator can only update their own
    const isAdmin = userRoles.includes(Role.ADMIN);
    
    // Handle products without moderatorId (created before ownership feature)
    const isOwner = existingProduct.moderatorId 
      ? existingProduct.moderatorId.toString() === userId 
      : false;

    // If product has no owner (legacy), allow anyone to update it OR admins can update
    if (existingProduct.moderatorId && !isAdmin && !isOwner) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres produits');
    }

    // Build update object with proper type conversion
    const updateData: any = {};
    if (productDto.nom !== undefined) updateData.nom = productDto.nom;
    if (productDto.prix !== undefined) updateData.prix = productDto.prix;
    if (productDto.description !== undefined) updateData.description = productDto.description;
    if (productDto.images !== undefined) updateData.images = productDto.images;
    if (productDto.specifications !== undefined) updateData.specifications = this.sanitizeSpecifications(productDto.specifications);
    if (productDto.categoryId !== undefined && productDto.categoryId !== 'none' && productDto.categoryId !== 'placeholder') {
      updateData.categoryId = new Types.ObjectId(productDto.categoryId);
      console.log('💾 Updating categoryId to:', updateData.categoryId);
    }
    if (productDto.quantite_en_stock !== undefined) updateData.quantite_en_stock = productDto.quantite_en_stock;

    const updated = await this.productModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('categoryId', 'name description')
      .populate('moderatorId', 'firstName lastName email')
      .exec();
    
    console.log('✅ Product updated, categoryId:', updated?.categoryId);
    return updated;
  }

  async remove(id: string, userId: string, userRoles: string[]): Promise<Product | null> {
    const existingProduct = await this.productModel.findById(id).exec();
    if (!existingProduct) {
      throw new NotFoundException(`Produit avec l'id ${id} introuvable`);
    }

    // Check ownership: admin can delete any product, moderator can only delete their own
    const isAdmin = userRoles.includes(Role.ADMIN);
    
    // Handle products without moderatorId (created before ownership feature)
    const isOwner = existingProduct.moderatorId 
      ? existingProduct.moderatorId.toString() === userId 
      : false;

    // If product has no owner (legacy), allow anyone to delete it OR admins can delete
    if (existingProduct.moderatorId && !isAdmin && !isOwner) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres produits');
    }

    // 🧹 Supprime la fiche de stats associée (même _id)
    await this.productStatsService.removeByProduct(id);

    // 🗑️ Puis supprime le produit
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
