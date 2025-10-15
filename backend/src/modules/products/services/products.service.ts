import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../schemas/product.schema';
import { ProductStatsService } from '../stats/product-stats.service';

@Injectable()
export class ProductsService {
  // constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly productStatsService: ProductStatsService, // 👈 injection du service
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

    // 🧹 Supprime la fiche de stats associée (même _id)
    await this.productStatsService.removeByProduct(id);

    // 🗑️ Puis supprime le produit
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
