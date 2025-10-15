import { BadRequestException, NotFoundException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductStats } from './product-stats.schema';

type ProductStatsLight = {
  _id: string; // même que Product
  quantite_en_stock: number;
  nombre_de_vente: number;
};

@Injectable()
export class ProductStatsService {
  constructor(
    @InjectModel(ProductStats.name)
    private statsModel: Model<ProductStats>,
  ) {}

  // Récupérer toutes les stats
  async findAll(details = false): Promise<any[]> {
    if (details) {
      const stats = await this.statsModel.find().populate('_id', '-__v').exec();
      return stats.map((s: any) => ({
        _id: s._id, // c’est le produit peuplé
        produit: s._id, // renommé pour clarté
        quantite_en_stock: s.quantite_en_stock,
        nombre_de_vente: s.nombre_de_vente,
      }));
    } else {
      return this.statsModel
        .find({}, { _id: 1, quantite_en_stock: 1, nombre_de_vente: 1 })
        .lean()
        .exec() as unknown as ProductStatsLight[];
    }
  }

  // Récupérer les stats d’un produit
  async findByProduct(productId: string, details = false): Promise<any> {
    const objectId = new Types.ObjectId(productId);

    if (details) {
      const stat = await this.statsModel
        .findOne({ product_id: objectId }) // 👈 ici le changement
        .populate('product_id', '-__v')
        .exec();

      if (!stat) return null;

      return {
        produit: stat.product_id, // produit complet
        quantite_en_stock: stat.quantite_en_stock,
        nombre_de_vente: stat.nombre_de_vente,
      };
    } else {
      return this.statsModel
        .findOne(
          { product_id: objectId }, // 👈 ici aussi
          { product_id: 1, quantite_en_stock: 1, nombre_de_vente: 1, _id: 0 },
        )
        .lean()
        .exec();
    }
  }


  // Créer une fiche de stats
  async create(stat: Partial<ProductStats>) {
    if (stat.product_id && typeof stat.product_id === 'string') {
      stat.product_id = new Types.ObjectId(stat.product_id);
    }
    return this.statsModel.create(stat);
  }

  // Mettre à jour les stats
  async updateByProduct(productId: string, update: Partial<ProductStats>) {
    const objectId = new Types.ObjectId(productId);
    return this.statsModel
      .findOneAndUpdate({ product_id: objectId }, update, { new: true, upsert: true })
      .exec();
  }

  async incrementSales(productId: string, quantity = 1) {
    const objectId = new Types.ObjectId(productId);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Le nombre d’articles vendus doit être un entier supérieur à 0');
    }

    const stat = await this.statsModel.findOne({ product_id: objectId }).exec();

    if (!stat) {
      throw new BadRequestException(`Aucune statistique trouvée pour le produit ${productId}`);
    }

    if (stat.quantite_en_stock < quantity) {
      throw new BadRequestException(
        `Stock insuffisant (${stat.quantite_en_stock} en stock, ${quantity} demandés)`,
      );
    }

    stat.nombre_de_vente += quantity;
    stat.quantite_en_stock -= quantity;

    return stat.save();
  }

  async restock(productId: string, quantity = 0) {
    const objectId = new Types.ObjectId(productId);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Le nombre d’articles ajoutés doit être un entier supérieur à 0');
    }

    const stat = await this.statsModel.findOne({ product_id: objectId }).exec();
    if (!stat) {
      throw new BadRequestException(`Aucune statistique trouvée pour le produit ${productId}`);
    }

    stat.quantite_en_stock += quantity;
    return stat.save();
  }


  // Supprimer les stats d’un produit
  async removeByProduct(productId: string) {
    const objectId = new Types.ObjectId(productId);
    const result = await this.statsModel.findOneAndDelete({ product_id: objectId }).exec();
    if (!result) throw new NotFoundException(`Stats du produit ${productId} introuvables`);
    return result;
  }


}
