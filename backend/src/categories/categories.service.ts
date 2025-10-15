import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './category.schema';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<Category>) {}

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().populate('id_categorie_mere', 'nom').exec();
  }

  async findOne(id: string): Promise<Category> {
    const cat = await this.categoryModel.findById(id).populate('id_categorie_mere', 'nom').exec();
    if (!cat) throw new NotFoundException(`Catégorie ${id} introuvable`);
    return cat;
  }

  async create(data: Partial<Category>): Promise<Category> {
    if (data.id_categorie_mere && typeof data.id_categorie_mere === 'string') {
      data.id_categorie_mere = new Types.ObjectId(data.id_categorie_mere);
    }
    return this.categoryModel.create(data);
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    if (data.id_categorie_mere && typeof data.id_categorie_mere === 'string') {
      data.id_categorie_mere = new Types.ObjectId(data.id_categorie_mere);
    }
    const updated = await this.categoryModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updated) throw new NotFoundException(`Catégorie ${id} introuvable`);
    return updated;
  }

  async remove(id: string): Promise<Category> {
    const deleted = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Catégorie ${id} introuvable`);
    return deleted;
  }
}
