import { Product } from '../schemas/product.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FilterProductsDto } from '../dto/filter-products.dto';
import {
  ProductCreateInput,
  ProductFilterInput,
  ProductSpecificationInput,
  ProductUpdateInput,
} from '../types/product.types';
import { ProductResponseDto } from '../dto/product-response.dto';

const sanitizeSpecifications = (specs?: Array<{ key: string; value: string }>): ProductSpecificationInput[] => {
  if (!specs || !Array.isArray(specs)) {
    return [];
  }

  return specs.map(spec => {
    let value = spec.value;
    if (typeof value === 'object' && value !== null) {
      value = (value as any).value ?? JSON.stringify(value);
    }

    return {
      key: String(spec.key),
      value: String(value),
    };
  });
};

const normalizeOptional = (value?: string): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export class ProductMapper {
  static fromCreateDto(dto: CreateProductDto, moderatorId: string): ProductCreateInput {
    return {
      nom: dto.nom.trim(),
      prix: dto.prix,
      description: normalizeOptional(dto.description),
      images: dto.images,
      specifications: sanitizeSpecifications(dto.specifications),
      categoryId: dto.categoryId,
      moderatorId,
      quantite_en_stock: dto.quantite_en_stock ?? 0,
    };
  }

  static fromUpdateDto(dto: UpdateProductDto): ProductUpdateInput {
    return {
      nom: dto.nom?.trim(),
      prix: dto.prix,
      description: normalizeOptional(dto.description),
      images: dto.images,
      specifications: dto.specifications ? sanitizeSpecifications(dto.specifications) : undefined,
      categoryId:
        dto.categoryId && !['none', 'placeholder'].includes(dto.categoryId)
          ? dto.categoryId
          : undefined,
      quantite_en_stock: dto.quantite_en_stock,
    };
  }

  static fromFilterDto(dto: FilterProductsDto): ProductFilterInput {
    let specifications: Record<string, string> | undefined;

    if (dto.specifications) {
      try {
        const parsed = JSON.parse(dto.specifications);
        if (typeof parsed === 'object' && parsed !== null) {
          specifications = Object.entries(parsed).reduce<Record<string, string>>((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {});
        }
      } catch {
        specifications = undefined;
      }
    }

    return {
      categoryId: dto.categoryId && dto.categoryId.trim() !== '' ? dto.categoryId.trim() : undefined,
      search: dto.search?.trim(),
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
      inStockOnly: dto.inStockOnly ?? false,
      page: dto.page ?? 1,
      limit: dto.limit ?? 12,
      specifications,
    };
  }

  static toResponse(product: Product): ProductResponseDto {
    const plain = typeof product.toObject === 'function' ? product.toObject() : product;
    const productId = plain._id?.toString?.() ?? plain.id;
    const categoryId = typeof plain.categoryId === 'object' && plain.categoryId?._id
      ? plain.categoryId._id.toString()
      : plain.categoryId?.toString?.();
    
    return {
      id: productId,
      _id: productId, // Add _id for frontend compatibility
      nom: plain.nom,
      prix: plain.prix,
      description: plain.description,
      images: plain.images,
      specifications: plain.specifications ?? [],
      categoryId: categoryId,
      id_categorie: categoryId || plain.id_categorie, // Ensure id_categorie is set for frontend
      moderatorId:
        typeof plain.moderatorId === 'object' && plain.moderatorId?._id
          ? plain.moderatorId._id.toString()
          : plain.moderatorId?.toString?.(),
      quantite_en_stock: plain.quantite_en_stock,
      date_de_creation: plain.date_de_creation,
    };
  }

  static toResponseList(products: Product[]): ProductResponseDto[] {
    return products.map(product => this.toResponse(product));
  }
}

