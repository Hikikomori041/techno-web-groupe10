# 🚀 Guide Rapide - Google Auth Sécurisé

## 1. Installation

```bash
cd backend
npm install cookie-parser @types/cookie-parser
```

## 2. Démarrer le Backend

```bash
npm run start:dev
```

## 3. Tester l'Authentification

### Option A : Via Navigateur
1. Ouvrir : `http://localhost:3000/auth/google`
2. Se connecter avec Google
3. Vous serez redirigé vers `/dashboard` (SANS données dans l'URL)

### Option B : Vérifier les Cookies (DevTools)
1. Après connexion, ouvrir DevTools > Application > Cookies
2. Vous verrez :
   - `access_token` (httpOnly: true) ✅ JWT sécurisé
   - `user_info` (httpOnly: false) ✅ Infos basiques pour l'UI

## 4. Routes Disponibles

### Vérifier si connecté
```bash
GET http://localhost:3000/auth/check
```

### Se déconnecter
```bash
POST http://localhost:3000/auth/logout
```

## 5. Frontend - Exemple d'Utilisation

```typescript
// Vérifier l'authentification au chargement du dashboard
useEffect(() => {
  fetch('http://localhost:3000/auth/check', {
    credentials: 'include' // ✅ Important
  })
  .then(res => res.json())
  .then(data => {
    if (data.authenticated) {
      setUser(data.user);
    } else {
      router.push('/login');
    }
  });
}, []);
```

## 6. Différences Clés

### ❌ AVANT (Insécure)
```
/dashboard?user=%7B%22email%22%3A%22user%40...
```
- Token visible dans l'URL
- Historique compromis
- Vulnérable

### ✅ MAINTENANT (Sécurisé)
```
/dashboard
```
- URL propre
- Token dans cookie httpOnly
- Protégé contre XSS/CSRF

## 📖 Documentation Complète

Voir `GOOGLE_AUTH_SECURE.md` pour tous les détails.

