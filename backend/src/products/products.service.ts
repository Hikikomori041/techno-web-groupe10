import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    // Si id_categorie est une string → on la convertit en ObjectId
    if (product.id_categorie && typeof product.id_categorie === 'string') {
      product.id_categorie = new Types.ObjectId(product.id_categorie);
    }

    // Création du produit
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


  async findByCategory(categoryId: string) {
    // 1) Vérifie le format de l’ObjectId
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new BadRequestException(`ID de catégorie invalide: ${categoryId}`);
    }
    const objectId = new Types.ObjectId(categoryId);

    // 2) Vérifie que la catégorie existe
    const exists = await this.categoryModel.exists({ _id: objectId });
    if (!exists) {
      throw new NotFoundException(`Category introuvable: ${categoryId}`);
    }

    // 3) Fonction récursive interne pour récupérer toute la descendance
    const getAllSubcategories = async (parentId: Types.ObjectId): Promise<Types.ObjectId[]> => {
    const subs = await this.categoryModel.find({ id_categorie_mere: parentId }, { _id: 1 }).lean();

    if (!subs.length) return [];

    // On caste explicitement en ObjectId
    const deeper = await Promise.all(
      subs.map(s => getAllSubcategories(new Types.ObjectId(s._id as any)))
    );

    // Même traitement ici
    return [...subs.map(s => new Types.ObjectId(s._id as any)), ...deeper.flat()];
  };


    // 4) Récupère toutes les sous-catégories (profondément)
    const allSubs = await getAllSubcategories(objectId);

    // 5) Crée la liste complète d’IDs à inclure
    const ids = [objectId, ...allSubs];

    // 6) Renvoie tous les produits associés
    return this.productModel
      .find({ id_categorie: { $in: ids } })
      .populate('id_categorie', 'nom')
      .exec();
  }

}
