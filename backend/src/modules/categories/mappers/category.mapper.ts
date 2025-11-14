import { Category } from '../schemas/category.schema';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { CategoryCreateInput, CategoryUpdateInput } from '../types/category.types';

const normalize = (value?: string): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export class CategoryMapper {
  static toCreateInput(dto: CreateCategoryDto): CategoryCreateInput {
    return {
      name: dto.name.trim(),
      description: normalize(dto.description),
      isActive: dto.isActive ?? true,
    };
  }

  static toUpdateInput(dto: UpdateCategoryDto): CategoryUpdateInput {
    return {
      name: dto.name ? dto.name.trim() : undefined,
      description: normalize(dto.description),
      isActive: dto.isActive,
    };
  }

  static toResponse(category: Category): CategoryResponseDto {
    const plain = typeof category.toObject === 'function' ? category.toObject() : category;
    const categoryId = plain._id?.toString?.() ?? plain.id;
    return {
      id: categoryId,
      _id: categoryId, // Add _id for frontend compatibility
      name: plain.name,
      description: plain.description,
      isActive: plain.isActive ?? true,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  }

  static toResponseList(categories: Category[]): CategoryResponseDto[] {
    return categories.map(category => this.toResponse(category));
  }
}

