# Frontend Authentication Update - Cookie-Based Auth

## ✅ Modifications Effectuées

Le frontend a été mis à jour pour utiliser l'authentification basée sur les cookies au lieu des paramètres d'URL.

### 1. Nouveau Helper d'Authentification

**Fichier créé:** `src/lib/auth.ts`

Ce fichier contient toutes les fonctions nécessaires pour gérer l'authentification :

- `checkAuth()` - Vérifie si l'utilisateur est authentifié
- `logout()` - Déconnexion de l'utilisateur
- `loginWithEmail()` - Connexion par email/password
- `getUserInfoFromCookie()` - Récupère les infos basiques du cookie

### 2. Dashboard Mis à Jour

**Fichier modifié:** `src/app/dashboard/DashboardContent.tsx`

**Avant (❌):**
```typescript
// Lisait les données depuis l'URL
const userParam = searchParams.get('user');
const userData = JSON.parse(decodeURIComponent(userParam));
```

**Maintenant (✅):**
```typescript
// Vérifie l'authentification via l'API
const result = await checkAuth();
if (result.authenticated) {
  setUser(result.user);
}
```

### 3. Page de Login Mise à Jour

**Fichier modifié:** `src/app/login/page.tsx`

**Avant (❌):**
```typescript
// Stockait dans localStorage et passait dans l'URL
localStorage.setItem('access_token', data.access_token);
router.push(`/dashboard?user=${userDataEncoded}`);
```

**Maintenant (✅):**
```typescript
// Le backend met le token dans les cookies automatiquement
// Redirection propre sans données dans l'URL
router.push('/dashboard');
```

---

## 🚀 Configuration

### 1. Variables d'Environnement (Optionnel)

Créer un fichier `.env.local` à la racine du frontend :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
```

### 2. Démarrer le Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend sera accessible sur `http://localhost:3001`

---

## 📝 Utilisation

### 1. Connexion avec Google

1. Cliquer sur "Continue with Google" sur `/login`
2. Se connecter avec Google
3. Redirection automatique vers `/dashboard`
4. ✅ Aucune donnée dans l'URL !

### 2. Connexion avec Email/Password

1. Cliquer sur "Sign in with Email"
2. Entrer email et mot de passe
3. Cliquer sur "Sign In"
4. Redirection vers `/dashboard`
5. ✅ Aucune donnée dans l'URL !

### 3. Dashboard

Le dashboard affiche maintenant :
- Photo de profil (ou initiales)
- Nom complet
- Email
- Rôles de l'utilisateur
- ID utilisateur
- Notice de sécurité

### 4. Déconnexion

Cliquer sur le bouton "Logout" qui :
1. Appelle `/auth/logout` sur le backend
2. Efface les cookies
3. Redirige vers `/login`

---

## 🔒 Sécurité

### Cookies Utilisés

| Cookie | HttpOnly | Description |
|--------|----------|-------------|
| `access_token` | ✅ Oui | JWT - Invisible au JavaScript |
| `user_info` | ❌ Non | Infos basiques pour l'UI (email, nom, rôles) |

### Flux d'Authentification

```
1. Login (Google/Email)
   ↓
2. Backend génère JWT et le met dans cookie httpOnly
   ↓
3. Redirection vers /dashboard (URL propre)
   ↓
4. Dashboard appelle GET /auth/check avec credentials: 'include'
   ↓
5. Backend lit le cookie et valide le JWT
   ↓
6. Retourne les infos utilisateur
```

---

## 🛠️ Développement

### Ajouter une Route Protégée

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth, User } from '@/lib/auth';

export default function ProtectedPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    const result = await checkAuth();
    
    if (!result.authenticated) {
      router.push('/login');
      return;
    }
    
    setUser(result.user);
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Hello {user?.firstName}</h1>
    </div>
  );
}
```

### Faire des Requêtes Authentifiées

```typescript
// TOUJOURS inclure credentials: 'include' pour envoyer les cookies
const response = await fetch('http://localhost:3000/api/protected-route', {
  credentials: 'include', // ✅ Important
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## 📊 Comparaison Avant/Après

### Avant (Insécure)
```
URL: /dashboard?user=%7B%22email%22%3A%22user%40example.com%22...
- Token visible dans l'URL
- Historique du navigateur compromis
- Logs contiennent le token
- Vulnérable aux attaques XSS
```

### Maintenant (Sécurisé)
```
URL: /dashboard
- URL propre
- Token dans cookie httpOnly
- Pas accessible en JavaScript
- Protégé contre XSS
- Historique propre
```

---

## 🐛 Débogage

### Vérifier les Cookies

1. Ouvrir DevTools (F12)
2. Aller dans "Application" > "Cookies"
3. Vérifier la présence de :
   - `access_token` (httpOnly: true)
   - `user_info` (httpOnly: false)

### Tester l'API de Check Auth

```bash
# Avec cookies
curl http://localhost:3000/auth/check \
  --cookie "access_token=YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Logs Console

Si vous voyez des erreurs CORS, vérifiez que :
1. Le backend a `credentials: true` dans CORS
2. Le frontend utilise `credentials: 'include'` dans fetch
3. L'origine correspond exactement (pas de slash final)

---

## ✅ Checklist de Migration

- [x] Helper d'authentification créé (`lib/auth.ts`)
- [x] Dashboard mis à jour pour utiliser `checkAuth()`
- [x] Login mis à jour avec `credentials: 'include'`
- [x] Logout appelle l'API backend
- [x] Plus de données dans l'URL
- [x] Cookies httpOnly utilisés
- [x] Interface utilisateur améliorée
- [x] Notice de sécurité ajoutée

---

## 📚 Ressources

- Backend Auth Doc: `../backend/GOOGLE_AUTH_SECURE.md`
- Backend Quick Setup: `../backend/QUICK_SETUP_GOOGLE_AUTH.md`
- Helper Auth: `src/lib/auth.ts`

