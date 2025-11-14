# Achetez.fr - Plateforme de e-commerce spécialisée dans l'informatique
 
Projet du groupe 10 (trinôme) du cours de M2 Technologies Web

- Nicolas BLACHÈRE
- Nabil BOUKERZAZA
- Youssef FATHANI

# Présentation
### [Lien vers la documentation du projet (Google Drive)](https://drive.google.com/drive/folders/14qSA7XSb8KrW9kJCuLcD16eIXa8ZCsqi?usp=sharing)

## Table des matières
- [Aperçu du projet](#aperçu-du-projet)
- [Organisation de l'équipe](#organisation-de-léquipe)
- [Base de données](#base-de-données)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Technologies utilisées](#technologies-utilisées)
- [Installation et configuration](#installation-et-configuration)
- [Structure du projet](#structure-du-projet)
- [API Documentation](#api-documentation)
- [Tests](#tests)
- [Captures d'écran](#captures-décran)
- [Licence](#licence)

## Aperçu du projet

Une plateforme e-commerce simplifiée pour la vente de matériel informatique, développée avec NestJS (backend) et Next.js (frontend). Le projet offre une expérience utilisateur fluide avec gestion des produits, panier d'achat, système de commandes, et tableau de bord administrateur. Le site propose une IA intégrée pour assister les vendeurs dans leurs créations de produits.

---

## 🚀 Test du projet

### Lien de déploiement
[À ajouter]

### Comptes de test

Après avoir exécuté le script de seed (`pnpm run seed` dans `/backend`), utilisez ces comptes :

| Rôle | Email | Mot de passe | Accès |
|------|-------|--------------|-------|
| **Admin** | `admin@achetez.com` | `password123` | Dashboard complet, gestion de tous les produits, catégories, commandes et utilisateurs |
| **Modérateur** | `moderator@achetez.com` | `password123` | Dashboard avec statistiques personnalisées, gestion de ses produits |
| **Utilisateur 1** | `user1@achetez.com` | `password123` | Navigation produits, panier, commandes personnelles |
| **Utilisateur 2** | `user2@achetez.com` | `password123` | Navigation produits, panier, commandes personnelles |

---

## 🛠️ Technologies utilisées

### Backend (NestJS)
- **Framework**: NestJS 11.x
- **Base de données**: MongoDB avec Mongoose
- **Authentification**: 
  - JWT (JSON Web Tokens)
  - Passport.js
  - Google OAuth 2.0
  - bcrypt pour le hashing des mots de passe
- **Documentation API**: Swagger/OpenAPI
- **Upload de fichiers**: Multer
- **Validation**: class-validator, class-transformer
- **Tests**: Jest

### Frontend (Next.js)
- **Framework**: Next.js 15.x avec App Router
- **UI Components**: 
  - Shadcn/ui (Radix UI)
  - Tailwind CSS
  - Lucide Icons
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **TypeScript**: Pour la sécurité des types

---

# Notes

## Organisation de l'équipe
- Front-end: Nabil & Youssef
- Back-end: Nabil & Nicolas
- Documentation & tests: Nicolas

## 4 vues à différencier :
- Visiteur
- Utilisateur
- Modérateur
- Administrateur

Le visiteur et l'utilisateur voit des produits qu'ils peuvent ajouter à leur panier.

Le modérateur gère une liste de produits (c'est un vendeur).

L'administrateur gère toute la base, des produits aux utilisateurs. Il possède un dashboard.

## Pages réalisées :
- Visiteur
    - Connexion
    - Création de compte
    - Produits
        - Accueil
        - Recherche de produits (tri & filtres)
        - Page d'un produit (détails)
        - Ajout d'un produit au panier
- Utilisateur
    - Visualisation des informations de compte
    - Panier (validation d'une commande)
- Vendeur
    - Gestion des produits (création, modification, suppression)
- Administrateur
    - Dashboard
        - Gestion des catégories
        - Gestion des produits
        - Gestion des commandes
        - Gestion des utilisateurs

## Fonctionnalité bonus
Lors de la création d'une produit, un modérateur peut faire générer sa description par IA, selon le nom du produit.

## Base de données
- Utilisateur (id_utilisateur, [role], mail, mot_de_passe, [nom], [prenom], date_creation_compte)
- Produit (id_produit, id_categorie, nom, prix, [description], [images], [specifications], date_de_creation)
- Statistiques_produit (id_produit, quantite_en_stock, nombre_de_vente)
- Commentaire (id_produit, id_utilisateur, [texte], note, date_commentaire)
- Categorie (id_categorie, nom, [id_categorie_mere])
- Panier (id_utilisateur, id_produit, quantite)
- Commande (id_utilisateur, liste_produits(id_produit, quantite), date_commande, statut, montant_total)

### Informations sur la base de données
- specifications et id_produits sont des tableaux
- les attributs entre crochets sont optionnels, les autres sont obligatoires


# Fonctionnalités principales

#### Partie Utilisateur
- **Authentification sécurisée**
  - Inscription/Connexion avec email et mot de passe
  - Authentification Google OAuth 2.0
  - Gestion des sessions avec JWT (cookies httpOnly)
  
- **Catalogue de produits**
  - Navigation par catégories
  - Filtres avancés (catégorie, prix, stock, spécifications)
  - Recherche de produits
  - Pages de détail produit avec spécifications complètes
  
- **Panier d'achat**
  - Ajout/suppression de produits
  - Modification des quantités
  - Persistance du panier (authentifié)
  - Calcul automatique du total
  
- **Système de commandes**
  - Processus de checkout complet
  - Collecte d'adresse de livraison
  - Gestion automatique des stocks
  - Suivi des commandes
  - Historique des commandes utilisateur

#### Partie Administration (Admin & Modérateur)
- **Dashboard analytique**
  - Statistiques de ventes en temps réel
  - Graphiques de revenus
  - Indicateurs de performance (KPI)
  - Produits les plus vendus
  
- **Gestion des produits**
  - CRUD complet des produits
  - Upload d'images
  - Génération automatique de descriptions par IA
  - Gestion des stocks
  - Spécifications personnalisées
  
- **Gestion des catégories**
  - CRUD des catégories
  - Activation/désactivation de catégories
  
- **Gestion des commandes**
  - Suivi des statuts de commandes
  - Mise à jour des états de livraison
  - Gestion des paiements
  
- **Gestion des utilisateurs** (Admin uniquement)
  - Liste de tous les utilisateurs
  - Attribution/modification des rôles
  - Gestion des permissions

## Installation et configuration

### Prérequis
- Node.js 18+ et npm/pnpm
- MongoDB (local ou Atlas)
- Compte Google Cloud (pour OAuth, optionnel)

### 1. Cloner le repository

```bash
git clone https://github.com/votre-repo/techno-web-groupe10.git
cd techno-web-groupe10
```

### 2. Installation et configuration

Pour installer les serveurs back-end et front-end, utilisez un terminal séparé dans les dossiers `/backend/` et `/frontend/`, et exécutez les commandes qui se trouvent dans le [README du back-end](./backend/README.md).
Les même commandes fonctionnent pour installer le front-end.
<!--ainsi que le [README du frontend](./frontend/README.md)-->

Pour lancer le serveur back-end (avec la connexion à la base de données), il vous faudra le `.env` avec toutes les informations, à mettre dans le dossier `/backend/`.

Pour lancer le serveur front-end, il faut utiliser `$env:PORT=3001;pnpm run dev`.

## Variables d'environnement dans `.env`:

```env
### MongoDB
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
DB_NAME=nom_de_la_base
DB_URL=url_atlas_ou_localhost

### JWT
JWT_SECRET=votre_secret_jwt_securise
JWT_EXPIRATION=7d

### Google OAuth (optionnel)
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google-redirect

### Frontend
FRONTEND_URL=http://localhost:3001
REDIRECT_LOGIN_URL=http://localhost:3001/products

### Server
PORT=3000
NODE_ENV=development
```

Pour trouver le `.env` fourni permettant l'accès à la base de données, veuillez consulter la [documentation Google Docs du projet](https://docs.google.com/document/d/13JVKV1lKW8zDC-Kk7DVPhG77et6-_0Df9Axdd_pTrQs/edit?tab=t.0#heading=h.vlm1ci9y8wmj).


Lancer le backend:

```bash
pnpm run start:dev
```

Le backend sera accessible sur `http://localhost:3000`
La documentation Swagger sur `http://localhost:3000/api`

### 3. Configuration du Frontend

```bash
cd frontend
pnpm install
```

Créer `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Lancer le frontend:

```bash
pnpm run dev
```

Le frontend sera accessible sur `http://localhost:3001`

### 4. Créer un utilisateur administrateur

Utiliser l'endpoint Swagger ou créer directement en base:

```bash
# Via MongoDB Shell ou Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { roles: ["admin"] } }
)
```

## Structure du projet

```text
techno-web-groupe10/
├── backend/
│   ├── src/
│   │   ├── common/           # Decorators, filters, enums partagés
│   │   ├── modules/
│   │   │   ├── auth/         # Authentification (JWT, Google OAuth)
│   │   │   ├── users/        # Gestion des utilisateurs
│   │   │   ├── products/     # Gestion des produits
│   │   │   ├── categories/   # Gestion des catégories
│   │   │   ├── cart/         # Panier d'achat
│   │   │   ├── orders/       # Système de commandes
│   │   │   ├── stats/        # Statistiques et analytics
│   │   │   └── upload/       # Upload d'images
│   │   ├── main.ts           # Point d'entrée
│   │   └── app.module.ts     # Module racine
│   ├── uploads/              # Stockage des images
│   ├── test/                 # Tests E2E
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── _ui/          # Composants UI réutilisables
│   │   │   ├── cart/         # Page panier
│   │   │   ├── checkout/     # Page de paiement
│   │   │   ├── products/     # Pages produits
│   │   │   ├── orders/       # Pages commandes
│   │   │   ├── dashboard/    # Dashboard admin
│   │   │   └── profile/      # Profil utilisateur
│   │   ├── components/       # Composants Shadcn/ui
│   │   ├── context/          # Context providers (Cart, Auth)
│   │   ├── lib/
│   │   │   └── api/          # Services API et endpoints
│   │   └── middleware.ts     # Middleware Next.js
│   ├── public/               # Assets statiques
│   └── package.json
└── README.md
```

## API Documentation

### Endpoints principaux

#### Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `GET /auth/google` - Connexion Google OAuth
- `GET /auth/check` - Vérifier l'authentification
- `POST /auth/logout` - Déconnexion

#### Produits
- `GET /products` - Liste des produits (avec filtres et pagination)
- `GET /products/:id` - Détails d'un produit
- `POST /products/create` - Créer un produit (Admin/Mod)
- `PUT /products/:id` - Modifier un produit (Admin/Mod)
- `DELETE /products/:id` - Supprimer un produit (Admin/Mod)
- `POST /products/:id/generate-description` - Générer description IA

#### Catégories
- `GET /categories` - Liste des catégories
- `POST /categories` - Créer une catégorie (Admin)
- `PUT /categories/:id` - Modifier une catégorie (Admin)
- `DELETE /categories/:id` - Supprimer une catégorie (Admin)

#### Panier
- `GET /cart` - Obtenir le panier
- `POST /cart/add` - Ajouter un produit
- `PUT /cart/update/:itemId` - Modifier la quantité
- `DELETE /cart/remove/:itemId` - Retirer un produit
- `DELETE /cart/clear` - Vider le panier

#### Commandes
- `POST /orders` - Créer une commande
- `GET /orders` - Obtenir les commandes utilisateur
- `GET /orders/:id` - Détails d'une commande
- `GET /orders/all` - Toutes les commandes (Admin/Mod)
- `PUT /orders/:id/status` - Modifier le statut (Admin/Mod)
- `DELETE /orders/:id` - Annuler une commande

#### Upload
- `POST /upload/image` - Upload d'image produit (Admin/Mod)

Documentation Swagger complète : `http://localhost:3000/api`

## Tests

### Backend

```bash
cd backend

# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Couverture de code
npm run test:cov
```

Tests implémentés:
- Services (Auth, Categories, Products)
- Tests E2E des endpoints principaux

### Frontend

```bash
cd frontend
npm run test
```

## Captures d'écran

### Page d'accueil
![Page d'accueil](https://drive.google.com/uc?export=view&id=1noz221_AkwMYnINe120ewTlOneSpUY1E)

### Connexion
![Page de connexion](https://drive.google.com/uc?export=view&id=1DGJHItoYxgWQaHaDhUpPdEJGjoVeDSui)

### Produits
![Produits](https://drive.google.com/uc?export=view&id=1D4zNs8H1-R9wjCb4wuxSJuFME5ublmn3)

### Détails d'un produit
![Détails d'un produit](https://drive.google.com/uc?export=view&id=1J24UB-VOPJZpnBowLra-elmG5oWbKt1E)

### Panier
![Panier](https://drive.google.com/uc?export=view&id=1jTU5SWva5AcQLH4E0DP23RthR8yQfwsy)

### Dashboard
![Dashboard - 1](https://drive.google.com/uc?export=view&id=1MXP8g6yAW-RaLxPJXnQf9gEgQ4d4o-so)
![Dashboard - 2](https://drive.google.com/uc?export=view&id=1Rpx9YohhlJled8bYihSI7qgQBm8wgc7U)

### Dashboard - Produits
![Dashboard - Produits](https://drive.google.com/uc?export=view&id=1cbF3NAjMoYTbwxXrJqKwLFrmfXsV16Lh)

### Dashboard - Catégories
![Dashboard - Catégories](https://drive.google.com/uc?export=view&id=1YapxPWRuFzmKHdkGH2ne-EU1Ns3w2UAN)

### Dashboard - Commandes
![Dashboard - Commandes](https://drive.google.com/uc?export=view&id=1UIPsKPy9oGL6MztFc3lBXyKsin-vyJVW)

### Dashboard - Utilisateurs
![Dashboard - Utilisateurs](https://drive.google.com/uc?export=view&id=1LbnQ3YG8Xh3EAdGewzSktdEO7Ic8J3pg)

## Licence

Ce projet est développé dans le cadre d'un cours universitaire.

---

**Dernière mise à jour**: Novembre 2025
**Version**: 1.0.0










