import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

export const GetAllProductStatsDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Récupérer la liste de toutes les statistiques produits',
    }),
    ApiResponse({
      status: 200,
      description: 'Liste des statistiques de tous les produits',
      schema: {
        example: [
          {
            id_produit: '68ee4c14e57e6afabdee367d',
            quantite_en_stock: 84,
            nombre_de_vente: 14,
          },
          {
            id_produit: '68ee4c14e57e6afabdee367e',
            quantite_en_stock: 42,
            nombre_de_vente: 8,
          },
        ],
      },
    }),
  );


export const GetProductStatsByIdDocs = () =>
  applyDecorators(
    ApiOperation({
      summary:
        'Récupérer les statistiques d’un produit spécifique',
    }),
    ApiParam({ name: 'id_produit', description: 'ID du produit' }),
    ApiResponse({
      status: 200,
      description: 'Statistiques du produit',
      schema: {
        example: {
          id_produit: '68ee4c14e57e6afabdee367d',
          quantite_en_stock: 84,
          nombre_de_vente: 14,
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Produit non trouvé' }),
  );

export const UpdateStockDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary:
        'Mettre à jour manuellement la quantité en stock d’un produit (Administrateur uniquement)',
    }),
    ApiParam({ name: 'id_produit', description: 'ID du produit' }),
    ApiBody({
      schema: {
        example: {
          quantite_en_stock: 4,
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Stock mis à jour avec succès',
      schema: {
        example: {
          id_produit: '68ee4c14e57e6afabdee367d',
          quantite_en_stock: 4,
          nombre_de_vente: 14,
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Quantité invalide' }),
    ApiResponse({ status: 401, description: 'Non authentifié' }),
    ApiResponse({ status: 403, description: 'Accès refusé - rôle Administrateur requis' }),
  );

export const SellProductDocs = () =>
  applyDecorators(
    ApiOperation({
      summary:
        'Décrémenter le stock et incrémenter le nombre de ventes (réservé au site, pas aux utilisateurs)',
    }),
    ApiParam({ name: 'id_produit', description: 'ID du produit' }),
    ApiBody({
      schema: {
        example: { quantity: 1 },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Vente enregistrée avec succès',
      schema: {
        example: {
          id_produit: '68ee4c14e57e6afabdee367d',
          quantite_en_stock: 83,
          nombre_de_vente: 15,
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Stock insuffisant ou quantité invalide' }),
  );

export const RestockProductDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Réapprovisionner un produit (Administrateur uniquement)',
    }),
    ApiParam({ name: 'id_produit', description: 'ID du produit' }),
    ApiBody({
      schema: {
        example: { quantity: 10 },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Produit réapprovisionné avec succès',
      schema: {
        example: {
          id_produit: '68ee4c14e57e6afabdee367d',
          quantite_en_stock: 94,
          nombre_de_vente: 15,
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Quantité invalide' }),
    ApiResponse({ status: 401, description: 'Non authentifié' }),
    ApiResponse({ status: 403, description: 'Accès refusé - rôle Administrateur requis' }),
  );
