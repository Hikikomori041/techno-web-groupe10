import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from '../categories/category.schema';
import { Product } from './product.schema';
import { ProductStatsService } from '../product-stats/product-stats.service';

@Injectable()
export class ProductsService {
  // constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly productStatsService: ProductStatsService,
  ) {}

  async findAll(): Promise<Product[]> {
    // Penser à ne pas envoyer l'id (pour des raisons de sécurité)
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<Product | null> {
    // Penser à ne pas envoyer l'id (pour des raisons de sécurité)
    return this.productModel.findById(id).exec();
  }

  async create(product: Partial<Product>): Promise<Product> {
    const newProduct = new this.productModel(product);
    return newProduct.save();
  }

  async update(id: string, product: Partial<Product>): Promise<Product | null> {
    const existingProduct = await this.productModel.findById(id).exec();
    if (!existingProduct) {
      throw new NotFoundException(`Produit avec l'id ${id} introuvable`);
    }
    return this.productModel.findByIdAndUpdate(id, product, { new: true }).exec();
  }

  async remove(id: string): Promise<Product | null> {
    const existingProduct = await this.productModel.findById(id).exec();
    if (!existingProduct) {
      throw new NotFoundException(`Produit avec l'id ${id} introuvable`);
    }

    // Supprime la fiche de stats associée (même _id)
    await this.productStatsService.removeByProduct(id);

    // Puis supprime le produit
    return this.productModel.findByIdAndDelete(id).exec();
  }


  async findByCategorie(categorieId: string) {
    const objectId = new Types.ObjectId(categorieId);

    // 🧭 Récupère aussi les sous-catégories
    const subcategories = await this.categoryModel
      .find({ id_categorie_mere: objectId }, { _id: 1 })
      .lean();

    // Liste complète des catégories à inclure
    const ids = [objectId, ...subcategories.map(c => c._id)];

    // 🎯 Recherche les produits appartenant à l'une de ces catégories
    return this.productModel
      .find({ id_categorie: { $in: ids } })
      .populate('id_categorie', 'nom')
      .exec();
  }

  // async findByCategorie(categorieId: string) {
  //   const objectId = new Types.ObjectId(categorieId);
  //   return this.productModel.find({
  //     $or: [
  //       { id_categorie: objectId },       // vrai ObjectId
  //       { id_categorie: categorieId },    // string équivalente
  //     ],
  //   })
  //   .populate('id_categorie', 'nom')
  //   .exec();
  // }

}
