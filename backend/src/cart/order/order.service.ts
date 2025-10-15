import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './order.schema';
import { Cart } from '../cart.schema';
import { Product } from '../../products/product.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async createOrder(id_utilisateur: string) {
    const userId = new Types.ObjectId(id_utilisateur);
    const cartItems = await this.cartModel.find({ id_utilisateur: userId }).populate('id_produit').exec();
    if (cartItems.length === 0) throw new BadRequestException('Panier vide');

    const liste_produits = cartItems.map(item => ({
      id_produit: item.id_produit._id,
      quantite: item.quantite,
    }));

    const montant_total = cartItems.reduce(
      (acc, item) => acc + item.quantite * (item.id_produit as any).prix,
      0,
    );

    const order = await this.orderModel.create({
      id_utilisateur: userId,
      liste_produits,
      montant_total,
      statut: 'en attente',
    });

    await this.cartModel.deleteMany({ id_utilisateur: userId }); // vide le panier
    return order;
  }

  async getOrdersByUser(id_utilisateur: string) {
    return this.orderModel
      .find({ id_utilisateur: new Types.ObjectId(id_utilisateur) })
      .populate('liste_produits.id_produit', 'nom prix')
      .exec();
  }

  async updateStatus(id_order: string, statut: string) {
    return this.orderModel.findByIdAndUpdate(id_order, { statut }, { new: true });
  }
}
