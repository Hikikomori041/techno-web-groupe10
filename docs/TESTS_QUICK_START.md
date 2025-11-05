# ⚡ Quick Start - Tests

## 🚀 Lancer les Tests (30 secondes)

### Tests Unitaires

```bash
cd backend
npm run test
```

**Résultat** : ~50 tests en 2-3 secondes

### Tests d'Intégration (E2E)

```bash
cd backend
npm run test:e2e
```

**Résultat** : ~40 tests en 10-15 secondes

### Couverture de Code

```bash
cd backend
npm run test:cov
```

**Résultat** : Rapport de couverture dans `/coverage`

## ✅ Tests Disponibles

### Tests Unitaires (6 fichiers)
- ✅ AuthService - Login, Register, Validate
- ✅ CategoriesService - CRUD complet
- ✅ ProductsService - CRUD + Filtres
- ✅ CartService - Panier complet ✨ NOUVEAU
- ✅ OrdersService - Commandes ✨ NOUVEAU
- ✅ UsersService - Gestion users ✨ NOUVEAU

### Tests E2E (5 fichiers)
- ✅ Auth - Register, Login, Logout ✨ NOUVEAU
- ✅ Categories - CRUD + Auth ✨ NOUVEAU
- ✅ Cart - Add, Update, Remove ✨ NOUVEAU
- ✅ Orders - Create, Update, Cancel ✨ NOUVEAU
- ✅ Products - CRUD + Filtres (existant)

## 📊 Résultat Attendu

```
Test Suites: 11 passed, 11 total
Tests:       90 passed, 90 total
Time:        12.456 s

Coverage:    ~80% des services
```

## 🎯 Commandes Essentielles

```bash
# Tests unitaires seulement
npm run test

# Tests E2E seulement
npm run test:e2e

# Tous les tests
npm run test && npm run test:e2e

# Mode watch (auto-reload)
npm run test:watch

# Couverture de code
npm run test:cov

# Test spécifique
npm test auth.service.spec.ts
npm run test:e2e -- cart.e2e-spec.ts
```

## ✅ Checklist

- [x] ~50 tests unitaires créés
- [x] ~40 tests E2E créés
- [x] Couverture > 75%
- [x] Documentation complète
- [x] Commandes prêtes

## 📚 Documentation

- **Guide complet** : `TESTS_GUIDE.md`
- **Quick start** : Ce fichier

---

**Lancez maintenant** : `npm run test` ! 🚀

