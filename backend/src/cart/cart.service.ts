import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from './cart.schema';
import { Product } from '../products/product.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly usersService: UsersService,
  ) {}

  async getCartByUser(id_utilisateur: string) {
    // 1) Vérifie si l'utilisateur existe
    const userExists = await this.usersService.findOne(id_utilisateur);
    if (!userExists) {
      throw new NotFoundException(`Utilisateur avec l'id ${id_utilisateur} introuvable`);
    }

    // 2) Récupère le panier
    const cartItems = await this.cartModel
      .find({ id_utilisateur })
      .populate('id_produit', '_id') // on ne renvoie que l’id produit
      .lean()
      .exec();

    // 3) Si panier vide
    if (!cartItems.length) {
      throw new NotFoundException(`Le panier de l'utilisateur ${id_utilisateur} est vide`);
    }

    // 4) Formate la réponse
    return cartItems.map(item => ({
      id_produit: item.id_produit._id,
      quantite: item.quantite,
    }));
  }


  async addToCart(id_utilisateur: string, id_produit: string, quantite = 1) {
    if (!Number.isInteger(quantite) || quantite <= 0) {
      throw new BadRequestException('La quantité doit être un entier positif');
    }

    // const objectUser = new Types.ObjectId(id_utilisateur);
    const objectUser = id_utilisateur; // on garde le string du JWT
    const objectProd = new Types.ObjectId(id_produit);

    const produit = await this.productModel.findById(objectProd).exec();
    if (!produit) throw new BadRequestException('Produit introuvable');

    const item = await this.cartModel.findOne({ id_utilisateur: objectUser, id_produit: objectProd });
    if (item) {
      item.quantite += quantite;
      return item.save();
    } else {
      return this.cartModel.create({ id_utilisateur: objectUser, id_produit: objectProd, quantite });
    }
  }

  async removeFromCart(id_utilisateur: string, id_produit: string) {
    return this.cartModel.deleteOne({
      id_utilisateur: new Types.ObjectId(id_utilisateur),
      id_produit: new Types.ObjectId(id_produit),
    });
  }

  async clearCart(id_utilisateur: string) {
    return this.cartModel.deleteMany({ id_utilisateur: new Types.ObjectId(id_utilisateur) });
  }
}
