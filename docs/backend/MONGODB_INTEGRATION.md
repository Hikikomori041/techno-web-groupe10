# MongoDB Integration - Auth Module

## Vue d'ensemble

Le module Auth utilise maintenant MongoDB pour stocker les données utilisateurs de manière persistante, remplaçant le stockage en mémoire précédent.

## Structure de la Collection `users`

### Schéma Mongoose

Fichier: `src/auth/schemas/user.schema.ts`

```typescript
@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  picture?: string;

  @Prop({ required: true, enum: ['local', 'google'], default: 'local' })
  provider: 'local' | 'google';

  @Prop({ type: [String], enum: Object.values(Role), default: [Role.USER] })
  roles: Role[];

  @Prop()
  googleId?: string;
}
```

### Champs de la Collection

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `_id` | ObjectId | Oui (auto) | ID unique MongoDB |
| `email` | String | Oui | Email unique de l'utilisateur |
| `password` | String | Oui | Mot de passe hashé (bcryptjs) |
| `firstName` | String | Non | Prénom |
| `lastName` | String | Non | Nom de famille |
| `picture` | String | Non | URL de la photo de profil |
| `provider` | String | Oui | 'local' ou 'google' |
| `roles` | String[] | Oui | Rôles: ['user', 'admin'] |
| `googleId` | String | Non | ID Google OAuth |
| `createdAt` | Date | Oui (auto) | Date de création |
| `updatedAt` | Date | Oui (auto) | Date de modification |

## Endpoints API Utilisant MongoDB

### 1. Inscription (POST /auth/register)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**MongoDB Operation:**
```javascript
await userModel.create({
  email: registerDto.email,
  password: hashedPassword,
  firstName: registerDto.firstName,
  lastName: registerDto.lastName,
  provider: 'local',
  roles: [Role.USER]
});
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "provider": "local",
    "roles": ["user"],
    "createdAt": "2025-10-15T07:00:00.000Z",
    "updatedAt": "2025-10-15T07:00:00.000Z"
  },
  "access_token": "eyJhbGc..."
}
```

### 2. Connexion (POST /auth/login)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**MongoDB Operation:**
```javascript
const user = await userModel.findOne({ email: loginDto.email });
```

### 3. Profil (GET /auth/profile)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**MongoDB Operation:**
```javascript
const user = await userModel.findById(userId).select('-password');
```

### 4. Liste des utilisateurs (GET /users) - Admin uniquement

**MongoDB Operation:**
```javascript
const users = await userModel.find().select('-password').exec();
```

### 5. Obtenir un utilisateur (GET /users/:id) - Admin uniquement

**MongoDB Operation:**
```javascript
const user = await userModel.findById(id).select('-password');
```

### 6. Mettre à jour les rôles (PUT /users/:id/role) - Admin uniquement

**Request:**
```json
{
  "roles": ["user", "admin"]
}
```

**MongoDB Operation:**
```javascript
const user = await userModel.findByIdAndUpdate(
  userId,
  { roles },
  { new: true }
).select('-password');
```

### 7. Supprimer un utilisateur (DELETE /users/:id) - Admin uniquement

**MongoDB Operation:**
```javascript
await userModel.findByIdAndDelete(userId);
```

## Authentification Google OAuth

Lorsqu'un utilisateur se connecte avec Google, le système :

1. Vérifie si l'email existe dans MongoDB
2. Si non, crée un nouvel utilisateur automatiquement :

```javascript
user = await userModel.create({
  email: emails[0].value,
  firstName: name.givenName,
  lastName: name.familyName,
  picture: photos[0].value,
  googleId: id,
  provider: 'google',
  password: Math.random().toString(36).slice(-8),
  roles: [Role.USER],
});
```

## Utilisateur Admin par Défaut

Au démarrage de l'application, un utilisateur admin est automatiquement créé s'il n'existe pas :

**Identifiants:**
- Email: `admin@example.com`
- Password: `admin123`
- Roles: `['admin', 'user']`

**Code:**
```javascript
async onModuleInit() {
  const adminExists = await this.userModel.findOne({ 
    email: 'admin@example.com' 
  });
  
  if (!adminExists) {
    await this.userModel.create({
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      provider: 'local',
      roles: [Role.ADMIN, Role.USER],
    });
  }
}
```

## Sécurité

### Hachage des mots de passe
- Utilisation de **bcryptjs** avec 10 rounds de salage
- Les mots de passe ne sont jamais retournés dans les réponses API

### Sélection de champs
```javascript
.select('-password')  // Exclut le mot de passe des résultats
```

## Test de l'intégration

### 1. Créer un utilisateur
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Se connecter
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### 3. Obtenir le profil
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <TOKEN>"
```

### 4. Liste des utilisateurs (Admin)
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

## Vérification dans MongoDB

Vous pouvez vérifier la collection directement dans MongoDB :

```javascript
// MongoDB Shell
use your_database_name
db.users.find().pretty()

// Compter les utilisateurs
db.users.countDocuments()

// Trouver l'admin
db.users.findOne({ email: "admin@example.com" })
```

## Avantages de cette intégration

✅ **Persistance** - Les données survivent aux redémarrages du serveur
✅ **Scalabilité** - Support de plusieurs instances d'application
✅ **Performance** - Indexation automatique sur l'email (unique)
✅ **Cohérence** - Même architecture que les modules Products et ProductStats
✅ **Production-ready** - Prêt pour un environnement de production
✅ **Sécurité** - Mots de passe hashés, validation des données

## Fichiers Modifiés

- ✅ `src/auth/schemas/user.schema.ts` - Nouveau schéma Mongoose
- ✅ `src/auth/auth.module.ts` - Import du modèle User
- ✅ `src/auth/auth.service.ts` - Migration vers MongoDB
- ✅ `src/auth/strategies/google.strategy.ts` - Sauvegarde OAuth dans MongoDB
- ✅ `src/users/users.service.ts` - Déjà intégré via AuthService

