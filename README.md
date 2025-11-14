# Achetez.com - Plateforme e-commerce

Plateforme e-commerce moderne et complète pour la vente de matériel informatique, développée avec **NestJS** (backend) et **Next.js** (frontend).

## À propos

Achetez.com est une solution e-commerce full-stack offrant une expérience utilisateur fluide et intuitive. La plateforme permet aux visiteurs de parcourir un catalogue de produits informatiques, de gérer leur panier d'achat, et de passer des commandes en toute sécurité. Les vendeurs (modérateurs) peuvent gérer leurs produits et suivre leurs statistiques de ventes via un dashboard personnalisé. Les administrateurs disposent d'un tableau de bord complet pour gérer l'ensemble de la plateforme : produits, catégories, commandes, utilisateurs et statistiques globales.

La plateforme intègre également une **intelligence artificielle** pour assister les vendeurs dans la création de produits. Lors de l'ajout d'un nouveau produit, les modérateurs peuvent utiliser l'IA pour générer automatiquement des descriptions détaillées et professionnelles basées sur le nom du produit, leur faisant gagner du temps et assurant une qualité de contenu optimale.

### Caractéristiques principales

- 🛒 **Gestion complète du panier** : Panier persistant synchronisé avec le compte utilisateur
- 📊 **Dashboard analytique** : Statistiques en temps réel avec graphiques de revenus sur 30 jours
- 🔐 **Authentification sécurisée** : JWT avec cookies httpOnly et support Google OAuth 2.0
- 👥 **Multi-rôles** : Système de permissions pour Visiteur, Utilisateur, Modérateur et Administrateur
- 🤖 **Intégration IA** : Génération automatique de descriptions produits par intelligence artificielle
- 📦 **Gestion des stocks** : Suivi automatique des quantités et alertes de stock faible
- 🎨 **Interface moderne** : Design responsive avec Tailwind CSS et composants Shadcn/ui
- 📱 **Pagination infinie** : Chargement progressif des produits pour une meilleure performance

**Projet du groupe 10** - M2 Technologies Web  
Nicolas BLACHÈRE | Nabil BOUKERZAZA | Youssef FATHANI

---

## 🚀 Test du projet

### Comptes de test

Après avoir exécuté le script de seed (`pnpm run seed` dans `/backend`), utilisez ces comptes :

| Rôle | Email | Mot de passe | Accès |
|------|-------|--------------|-------|
| **Admin** | `admin@achetez.com` | `password123` | Dashboard complet, gestion de tous les produits, catégories, commandes et utilisateurs |
| **Modérateur** | `moderator@achetez.com` | `password123` | Dashboard avec statistiques personnalisées, gestion de ses produits |
| **Utilisateur 1** | `user1@achetez.com` | `password123` | Navigation produits, panier, commandes personnelles |
| **Utilisateur 2** | `user2@achetez.com` | `password123` | Navigation produits, panier, commandes personnelles |

> **Lien de déploiement** : [À ajouter]

---

## 📋 Fonctionnalités

### Visiteur / Utilisateur
- Authentification (email/mot de passe ou Google OAuth)
- Catalogue de produits avec filtres et recherche
- Panier d'achat persistant
- Checkout et gestion des commandes
- Profil utilisateur

### Modérateur (Vendeur)
- Dashboard avec statistiques personnalisées
- Graphique de revenus sur 30 jours
- Gestion de ses produits (CRUD)
- Visualisation des commandes contenant ses produits

### Administrateur
- Dashboard complet avec statistiques globales
- Gestion des catégories, produits, commandes et utilisateurs
- Attribution des rôles
- Graphiques et analytics

### Fonctionnalités techniques
- Authentification JWT avec cookies httpOnly
- Google OAuth 2.0
- Génération de descriptions produits par IA
- Upload d'images multiples
- Pagination infinie
- Gestion des stocks automatique

---

## 🛠️ Technologies

**Backend**: NestJS, MongoDB, Mongoose, JWT, Passport.js, Swagger  
**Frontend**: Next.js 15, TypeScript, Tailwind CSS, Shadcn/ui, Axios

---

## 📦 Installation

### Prérequis
- Node.js 18+
- MongoDB (local ou Atlas)
- pnpm (ou npm)

### Backend

```bash
cd backend
pnpm install
```

Créer `.env` :
```env
DB_URL=mongodb://...
JWT_SECRET=votre_secret
GOOGLE_CLIENT_ID=votre_client_id (optionnel)
GOOGLE_CLIENT_SECRET=votre_client_secret (optionnel)
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google-redirect
PORT=3000
```

```bash
pnpm run start:dev
```

### Frontend

```bash
cd frontend
pnpm install
```

Créer `.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

```bash
pnpm run dev
```

### Seed (données de test)

```bash
cd backend
pnpm run seed
```

Crée 6 catégories, 13 produits, 4 utilisateurs et 17 commandes.

---

## 🔧 Configuration Google OAuth (Optionnel)

1. Créer un projet dans [Google Cloud Console](https://console.cloud.google.com/)
2. Créer des identifiants OAuth 2.0 (Web application)
3. Configurer les URI :
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/auth/google-redirect`
4. Ajouter les identifiants dans `.env`

---

## 📡 API Principale

### Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `GET /auth/google` - Connexion Google OAuth
- `GET /auth/check` - Vérifier l'authentification
- `POST /auth/logout` - Déconnexion

### Produits
- `GET /products` - Liste (filtres, pagination)
- `GET /products/:id` - Détails
- `POST /products/create` - Créer (Admin/Mod)
- `PUT /products/:id` - Modifier (Admin/Mod)
- `DELETE /products/:id` - Supprimer (Admin/Mod)

### Panier
- `GET /cart` - Obtenir le panier
- `POST /cart/add` - Ajouter un produit
- `PUT /cart/update/:itemId` - Modifier quantité
- `DELETE /cart/remove/:itemId` - Retirer
- `DELETE /cart/clear` - Vider

### Commandes
- `POST /orders` - Créer une commande
- `GET /orders` - Commandes utilisateur
- `GET /orders/all` - Toutes (Admin/Mod)
- `PUT /orders/:id/status` - Modifier statut

Documentation Swagger complète : `http://localhost:3000/api`

---

## 📚 Documentation

[Lien vers la documentation complète (Google Drive)](https://drive.google.com/drive/folders/14qSA7XSb8KrW9kJCuLcD16eIXa8ZCsqi?usp=sharing)

---

**Version**: 1.0.0 | **Dernière mise à jour**: 2025
