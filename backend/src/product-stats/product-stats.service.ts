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
  async findAll(): Promise<any[]> {
    return this.statsModel
      .find({}, { _id: 0, id_produit: 1, quantite_en_stock: 1, nombre_de_vente: 1 })
      .lean()
      .exec() as unknown as ProductStatsLight[];
  }

  // Récupérer les stats d’un produit
  async findByProduct(productId: string, details = false): Promise<any> {
    const objectId = new Types.ObjectId(productId);

    return this.statsModel
      .findOne(
        { id_produit: objectId },
        { id_produit: 1, quantite_en_stock: 1, nombre_de_vente: 1, _id: 0 },
      )
      .lean()
      .exec();
  }

  // Créer une fiche de stats
  async create(stat: Partial<ProductStats>) {
    if (stat.id_produit && typeof stat.id_produit === 'string') {
      stat.id_produit = new Types.ObjectId(stat.id_produit);
    }
    return this.statsModel.create(stat);
  }

  // Mettre à jour les stats
  async updateByProduct(productId: string, update: Partial<ProductStats>) {
    const objectId = new Types.ObjectId(productId);
    return this.statsModel
      .findOneAndUpdate({ id_produit: objectId }, update, { new: true, upsert: true })
      .exec();
  }

  async incrementSales(productId: string, quantity = 1) {
    const objectId = new Types.ObjectId(productId);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Le nombre d’articles vendus doit être un entier supérieur à 0');
    }

    const stat = await this.statsModel.findOne({ id_produit: objectId }).exec();

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

    const stat = await this.statsModel.findOne({ id_produit: objectId }).exec();
    if (!stat) {
      throw new BadRequestException(`Aucune statistique trouvée pour le produit ${productId}`);
    }

    stat.quantite_en_stock += quantity;
    return stat.save();
  }


  // Supprimer les stats d’un produit
  async removeByProduct(productId: string) {
    const objectId = new Types.ObjectId(productId);
    const result = await this.statsModel.findOneAndDelete({ id_produit: objectId }).exec();
    if (!result) throw new NotFoundException(`Stats du produit ${productId} introuvables`);
    return result;
  }


}
