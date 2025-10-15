import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

export const GetAllProductsDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Récupérer la liste de tous les produits' }),
    ApiResponse({
      status: 200,
      description: 'Liste complète des produits',
      schema: {
        example: [
          {
            _id: '68ee4c14e57e6afabdee367d',
            nom: 'Laptop Gamer ASUS v2',
            prix: 1299.99,
            description: 'PC portable gaming avec RTX 4060',
            images: ['image1.jpg', 'image2.jpg'],
            specifications: { cpu: 'Intel i7', ram: '16GB', gpu: 'RTX 4060' },
            id_categorie: '68ef5292bdfb36f434d021d1',
            date_de_creation: '2025-10-14T13:11:48.299Z',
          },
        ],
      },
    }),
  );

export const GetProductByIdDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Récupérer un produit par son ID' }),
    ApiParam({ name: 'id', description: 'ID du produit' }),
    ApiResponse({
      status: 200,
      description: 'Détails du produit',
      schema: {
        example: {
          _id: '68ee4c14e57e6afabdee367d',
          nom: 'Laptop Gamer ASUS v2',
          prix: 1299.99,
          description: 'PC portable gaming avec RTX 4060',
          images: ['image1.jpg', 'image2.jpg'],
          specifications: { cpu: 'Intel i7', ram: '16GB', gpu: 'RTX 4060' },
          id_categorie: '68ef5292bdfb36f434d021d1',
          date_de_creation: '2025-10-14T13:11:48.299Z',
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Produit non trouvé' }),
  );

export const CreateProductDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Créer un nouveau produit (Administrateur uniquement)' }),
    ApiBody({
      schema: {
        example: {
          nom: 'Ordinateur Fixe MSI Titan X',
          prix: 2499.99,
          description:
            "Ordinateur de bureau hautes performances équipé d'une RTX 4070 et d'un processeur Ryzen 7, idéal pour le gaming et la création.",
          images: ['msi_titanx_front.jpg', 'msi_titanx_side.jpg'],
          specifications: {
            cpu: 'AMD Ryzen 7 7800X3D',
            ram: '32GB DDR5',
            gpu: 'NVIDIA GeForce RTX 4070',
            stockage: '1TB SSD NVMe',
            carte_mere: 'MSI B650 Tomahawk',
            alimentation: '750W 80+ Gold',
          },
          id_categorie: '68ef5292bdfb36f434d021d1',
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Produit créé avec succès',
      schema: {
        example: {
          _id: '68ee4c14e57e6afabdee367d',
          nom: 'Ordinateur Fixe MSI Titan X',
          prix: 2499.99,
          id_categorie: '68ef5292bdfb36f434d021d1',
          date_de_creation: '2025-10-14T13:11:48.299Z',
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Non authentifié' }),
    ApiResponse({ status: 403, description: 'Accès refusé - rôle Administrateur requis' }),
  );

export const UpdateProductDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Mettre à jour un produit (Administrateur uniquement)' }),
    ApiParam({ name: 'id', description: 'ID du produit' }),
    ApiBody({
      schema: {
        example: {
          prix: 2799.99,
          description: 'Mise à jour du modèle MSI Titan X avec plus de RAM',
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Produit mis à jour avec succès',
    }),
    ApiResponse({ status: 401, description: 'Non authentifié' }),
    ApiResponse({ status: 403, description: 'Accès refusé - rôle Administrateur requis' }),
    ApiResponse({ status: 404, description: 'Produit non trouvé' }),
  );

export const DeleteProductDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Supprimer un produit (Administrateur uniquement)' }),
    ApiParam({ name: 'id', description: 'ID du produit' }),
    ApiResponse({
      status: 200,
      description: 'Produit supprimé avec succès',
      schema: { example: { message: 'Product deleted successfully' } },
    }),
    ApiResponse({ status: 401, description: 'Non authentifié' }),
    ApiResponse({ status: 403, description: 'Accès refusé - rôle Administrateur requis' }),
    ApiResponse({ status: 404, description: 'Produit non trouvé' }),
  );
