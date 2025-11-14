import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CategoryCreateInput, CategoryUpdateInput } from './types/category.types';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(input: CategoryCreateInput): Promise<Category> {
    // Check if category with same name already exists
    const existing = await this.categoryModel.findOne({ name: input.name }).exec();
    if (existing) {
      throw new ConflictException(`Category with name "${input.name}" already exists`);
    }

    const category = new this.categoryModel(input);
    return category.save();
  }

  async update(id: string, updateCategoryDto: CategoryUpdateInput): Promise<Category> {
    // Check if category exists
    const existing = await this.findOne(id);

    // If updating name, check for duplicates
    if (updateCategoryDto.name && updateCategoryDto.name !== existing.name) {
      const duplicate = await this.categoryModel.findOne({ name: updateCategoryDto.name }).exec();
      if (duplicate) {
        throw new ConflictException(`Category with name "${updateCategoryDto.name}" already exists`);
      }
    }

    const updated = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<Category> {
    const category = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }
}

