# 🐛 Debug - Erreur "Failed to add item to cart"

## 🎯 Problème

Erreur lors de l'ajout d'un produit au panier : "Failed to add item to cart"

## 🔍 Modifications Appliquées pour le Debug

### 1. Backend - Controller

**Fichier** : `/backend/src/modules/cart/cart.controller.ts`

**Ajouté** :
```typescript
console.log('🛒 ADD TO CART - Controller received:', {
  userId,
  productId: addToCartDto.productId,
  quantity: addToCartDto.quantity,
});

// ... call service ...

console.log('✅ ADD TO CART - Success');
// or
console.error('❌ ADD TO CART - Error:', error.message);
```

### 2. Backend - Service

**Fichier** : `/backend/src/modules/cart/cart.service.ts`

**Ajouté** :
```typescript
console.log('🛒 CartService.addToCart called:', { userId, productId, quantity });
console.log('✅ Product found:', product.nom);
console.log('❌ Insufficient stock:', { available, requested });
console.log('📦 Item already in cart, updating quantity');
console.log('🆕 Creating new cart item');
console.log('✅ Cart item created successfully');
```

**Validation Stock Ajoutée** :
```typescript
if (product.quantite_en_stock < quantity) {
  throw new BadRequestException(`Insufficient stock. Only ${product.quantite_en_stock} available`);
}
```

### 3. Frontend - Context

**Fichier** : `/frontend/src/context/cart.context.tsx`

**Ajouté** :
```typescript
console.log('🛒 Frontend addItemToCart:', { productId, quantity, isAuthenticated });
console.log('📡 Calling backend addToCart...');
console.log('✅ Backend call successful, reloading cart...');
console.error('❌ Error adding item to cart:', error);
console.error('Error details:', { message, response, status });
```

**Message d'Erreur Amélioré** :
```typescript
const errorMessage = error.response?.data?.message || error.message || "Failed to add item to cart";
toast.error(errorMessage);
```

## 🚀 Comment Diagnostiquer

### Étape 1 : Redémarrez le Backend

```bash
cd backend
npm run start:dev
```

### Étape 2 : Ouvrez la Console

1. Ouvrez le site : http://localhost:3001
2. Ouvrez la console (F12)
3. Allez dans l'onglet Console

### Étape 3 : Ajoutez un Produit au Panier

1. Naviguez vers un produit
2. Cliquez "Ajouter au panier"
3. **Regardez les logs** dans :
   - Console Frontend (F12)
   - Terminal Backend

## 📊 Logs Attendus (Si Tout Fonctionne)

### Console Frontend (F12)

```javascript
🛒 Frontend addItemToCart: {
  productId: "68f87ccd602341d144705cf6",
  quantity: 1,
  isAuthenticated: true
}
📡 Calling backend addToCart...
✅ Backend call successful, reloading cart...
```

### Terminal Backend

```
🛒 ADD TO CART - Controller received: {
  userId: "68ef526cbdfb36f434d021ce",
  productId: "68f87ccd602341d144705cf6",
  quantity: 1
}
🛒 CartService.addToCart called: {
  userId: "68ef526cbdfb36f434d021ce",
  productId: "68f87ccd602341d144705cf6",
  quantity: 1
}
✅ Product found: MacBook Pro 16
🆕 Creating new cart item
💾 Cart item saved
✅ Cart item created successfully
✅ ADD TO CART - Success
```

## 🐛 Diagnostic Selon les Logs

### Cas 1 : "Product not found"

**Logs Backend** :
```
❌ Product not found: 68f87ccd...
```

**→ Cause** : Le produit n'existe pas dans la DB

**→ Solution** :
```bash
# Vérifiez que le produit existe
curl http://localhost:3000/products | jq '.products[] | {_id, nom}'
```

### Cas 2 : "Insufficient stock"

**Logs Backend** :
```
❌ Insufficient stock: { available: 0, requested: 1 }
```

**→ Cause** : Stock épuisé

**→ Solution** :
- Mettez à jour le stock du produit dans le dashboard
- Ou testez avec un autre produit

### Cas 3 : Pas de Log Backend

**Console Frontend** :
```
🛒 Frontend addItemToCart: { ... }
📡 Calling backend addToCart...
❌ Error adding item to cart: Network Error
```

**→ Cause** : Backend ne répond pas

**→ Solution** :
```bash
# Vérifiez que le backend tourne
curl http://localhost:3000/cart
# Devrait retourner 401 (Unauthorized) si le backend fonctionne
```

### Cas 4 : "Unauthorized" (401)

**Console Frontend** :
```
❌ Error adding item to cart
Error details: { status: 401, message: "Unauthorized" }
```

**→ Cause** : Utilisateur non authentifié ou JWT invalide

**→ Solution** :
1. Vérifiez que vous êtes connecté
2. Reconnectez-vous
3. Vérifiez les cookies (F12 → Application → Cookies)

### Cas 5 : Erreur de Validation

**Logs Backend** :
```
❌ ADD TO CART - Error: Validation failed
```

**→ Cause** : DTO invalide (productId ou quantity)

**→ Solution** :
Vérifiez que le frontend envoie bien :
```typescript
{
  productId: "string_id_valide",  // ObjectId MongoDB
  quantity: 1                     // Number > 0
}
```

## 🔧 Vérifications Rapides

### 1. Backend Fonctionne ?

```bash
curl http://localhost:3000/products
# Devrait retourner la liste des produits
```

### 2. Authentification OK ?

Console Frontend (F12) :
```javascript
// Tapez dans la console
document.cookie
// Devrait montrer : access_token=...
```

### 3. Endpoint Correct ?

**Frontend envoie à** : `POST /cart`
**Backend écoute sur** : `POST /cart`
✅ Match !

### 4. Structure de Données Correcte ?

**Frontend envoie** :
```json
{
  "productId": "68f87ccd...",
  "quantity": 1
}
```

**Backend attend** (AddToCartDto) :
```typescript
{
  productId: string;
  quantity?: number;
}
```
✅ Match !

## 🆘 Solutions Rapides

### Solution 1 : Redémarrer le Backend

```bash
cd backend
# Ctrl+C
npm run start:dev
```

### Solution 2 : Vider le Panier et Réessayer

```bash
# Via l'API
curl -X DELETE http://localhost:3000/cart/clear \
  -H "Cookie: access_token=VOTRE_TOKEN"

# Ou dans l'interface
# Allez sur /cart et cliquez "Clear Cart"
```

### Solution 3 : Reconnectez-vous

1. Déconnectez-vous (menu utilisateur → Logout)
2. Reconnectez-vous
3. Réessayez d'ajouter au panier

### Solution 4 : Testez avec Curl

```bash
# 1. Obtenez votre token (après login)
# F12 → Application → Cookies → access_token

# 2. Testez l'ajout au panier
curl -X POST http://localhost:3000/cart \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=VOTRE_TOKEN" \
  -d '{
    "productId": "ID_PRODUIT_VALIDE",
    "quantity": 1
  }'

# Si ça fonctionne → Problème côté frontend
# Si ça échoue → Problème côté backend
```

## 📋 Checklist de Debug

- [ ] Backend redémarré
- [ ] Console F12 ouverte
- [ ] Terminal backend visible
- [ ] Utilisateur connecté (vérifier cookie)
- [ ] Produit existe dans la DB
- [ ] Produit a du stock (> 0)
- [ ] Logs frontend affichés
- [ ] Logs backend affichés
- [ ] Message d'erreur précis noté

## 🎯 Après Debug

**Envoyez-moi** :

1. **Console Frontend** (tous les logs 🛒, 📡, ❌)
2. **Terminal Backend** (tous les logs 🛒, ✅, ❌)
3. **Message d'erreur** exact
4. **Network Tab** (F12 → Network → POST /cart → Response)

Avec ces informations, je pourrai identifier exactement le problème !

---

**Date** : Novembre 2024  
**Version** : Cart Debug v1.0  
**Statut** : ✅ Logs ajoutés pour diagnostic
**Action** : Redémarrez backend, testez, et regardez les logs !

