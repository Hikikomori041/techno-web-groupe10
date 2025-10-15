import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

export const GetAllCategoriesDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Récupérer toutes les catégories' }),
    ApiResponse({
      status: 200,
      description: 'Liste complète des catégories',
      schema: {
        example: [
          {
            _id: '68ef526cbdfb36f434d021ce',
            name: 'Ordinateurs',
            id_categorie_mere: null,
          },
          {
            _id: '68ef5292bdfb36f434d021d1',
            name: 'PC portables',
            id_categorie_mere: '68ef526cbdfb36f434d021ce',
          },
        ],
      },
    }),
  );

export const GetCategoryByIdDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Récupérer une catégorie par son ID' }),
    ApiParam({ name: 'id', description: 'ID de la catégorie' }),
    ApiResponse({
      status: 200,
      description: 'Détails de la catégorie',
      schema: {
        example: {
          _id: '68ef5292bdfb36f434d021d1',
          name: 'PC portables',
          id_categorie_mere: '68ef526cbdfb36f434d021ce',
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Catégorie non trouvée' }),
  );

export const CreateCategoryDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Créer une nouvelle catégorie (Administrateur uniquement)' }),
    ApiBody({
      schema: {
        example: {
          name: 'Accessoires PC',
          id_categorie_mere: '68ef5292bdfb36f434d021d1',
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Catégorie créée avec succès',
      schema: {
        example: {
          _id: '68ef5300bdfb36f434d021d5',
          name: 'Accessoires PC',
          id_categorie_mere: '68ef5292bdfb36f434d021d1',
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Non authentifié' }),
    ApiResponse({ status: 403, description: 'Accès refusé - rôle Admin requis' }),
  );

export const UpdateCategoryDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Mettre à jour une catégorie (Administrateur uniquement)' }),
    ApiParam({ name: 'id', description: 'ID de la catégorie' }),
    ApiBody({
      schema: {
        example: {
          name: 'Composants PC',
          id_categorie_mere: '68ef526cbdfb36f434d021ce',
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Catégorie mise à jour avec succès',
    }),
    ApiResponse({ status: 401, description: 'Non authentifié' }),
    ApiResponse({ status: 403, description: 'Accès refusé - rôle Administrateur requis' }),
    ApiResponse({ status: 404, description: 'Catégorie non trouvée' }),
  );

export const DeleteCategoryDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Supprimer une catégorie (Administrateur uniquement)' }),
    ApiParam({ name: 'id', description: 'ID de la catégorie' }),
    ApiResponse({
      status: 200,
      description: 'Catégorie supprimée avec succès',
      schema: { example: { message: 'Category deleted successfully' } },
    }),
    ApiResponse({ status: 401, description: 'Non authentifié' }),
    ApiResponse({ status: 403, description: 'Accès refusé - rôle Administrateur requis' }),
    ApiResponse({ status: 404, description: 'Catégorie non trouvée' }),
  );

export const GetProductsByCategoryDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Lister les produits d’une catégorie (et ses sous-catégories)' }),
    ApiParam({ name: 'id', description: 'ID de la catégorie' }),
    ApiResponse({
      status: 200,
      description: 'Liste des produits associés',
      schema: {
        example: [
          {
            _id: '68ee4c14e57e6afabdee367d',
            nom: 'Laptop Gamer ASUS',
            prix: 1499.99,
            id_categorie: '68ef5292bdfb36f434d021d1',
          },
        ],
      },
    }),
    ApiResponse({ status: 404, description: 'Catégorie non trouvée' }),
  );
