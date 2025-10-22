# Google OAuth - Solution Sécurisée (Sans données dans l'URL)

## ❌ Problème Initial

Avant, les données utilisateur étaient passées dans l'URL :
```typescript
// INSÉCURE - NE PAS FAIRE ❌
res.redirect(`/dashboard?user=${JSON.stringify(userData)}`);
```

**Risques :**
- Données exposées dans l'URL
- Historique du navigateur
- Logs du serveur
- Interception possible
- Pas de protection XSS/CSRF

---

## ✅ Solution Implémentée : Cookies HttpOnly

### 1. Installation Requise

```bash
npm install cookie-parser @types/cookie-parser
```

### 2. Fonctionnement

#### Backend (NestJS)

**a) Configuration dans `main.ts` :**
```typescript
import * as cookieParser from 'cookie-parser';

app.use(cookieParser());
app.enableCors({
  origin: 'http://localhost:3001',
  credentials: true, // ✅ Important pour les cookies
});
```

**b) Après authentification Google (`auth.controller.ts`) :**
```typescript
@Get('google-redirect')
googleAuthRedirect(@Request() req, @Res() res: Response) {
  const { access_token, user } = this.authService.googleLogin(req);
  
  // ✅ JWT dans cookie httpOnly (sécurisé)
  res.cookie('access_token', access_token, {
    httpOnly: true,        // Pas accessible en JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only en prod
    sameSite: 'lax',       // Protection CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  });

  // ✅ Infos basiques pour l'UI (non-sensibles)
  res.cookie('user_info', JSON.stringify({
    email: user.email,
    firstName: user.firstName,
    roles: user.roles,
  }), {
    httpOnly: false,       // Accessible au frontend
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // ✅ Redirection SANS données dans l'URL
  return res.redirect(`${process.env.REDIRECT_LOGIN_URL}/dashboard`);
}
```

---

### 3. Nouvelles Routes Disponibles

#### **a) Vérifier l'authentification**
```http
GET /auth/check
```

**Réponse si authentifié :**
```json
{
  "authenticated": true,
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "roles": ["user"]
  }
}
```

**Réponse si non authentifié :**
```json
{
  "authenticated": false
}
```

#### **b) Se déconnecter**
```http
POST /auth/logout
```

**Réponse :**
```json
{
  "message": "Logged out successfully"
}
```

---

### 4. Frontend (React/Next.js)

#### **a) Récupérer les infos utilisateur depuis le cookie**

```typescript
// Dans votre page dashboard
import { useEffect, useState } from 'react';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('http://localhost:3000/auth/check', {
        credentials: 'include', // ✅ Important : envoie les cookies
      });
      
      const data = await res.json();
      
      if (data.authenticated) {
        setUser(data.user);
      } else {
        // Rediriger vers login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div>
      <h1>Bienvenue {user.firstName}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

#### **b) Alternative : Lire le cookie `user_info` directement**

```typescript
// Fonction helper pour lire les cookies
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

// Dans votre composant
const userInfo = getCookie('user_info');
const user = userInfo ? JSON.parse(decodeURIComponent(userInfo)) : null;
```

#### **c) Se déconnecter**

```typescript
const logout = async () => {
  await fetch('http://localhost:3000/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  
  window.location.href = '/login';
};
```

---

### 5. Requêtes API Protégées

Pour les requêtes qui nécessitent l'authentification :

```typescript
// Les cookies sont automatiquement envoyés avec credentials: 'include'
const response = await fetch('http://localhost:3000/auth/profile', {
  credentials: 'include', // ✅ Envoie le cookie access_token
});
```

---

## 🔒 Sécurité

### Protections Implémentées

| Protection | Description |
|-----------|-------------|
| **httpOnly** | Le token JWT n'est pas accessible en JavaScript (protection XSS) |
| **secure** | Cookie envoyé uniquement en HTTPS en production |
| **sameSite: 'lax'** | Protection contre CSRF |
| **credentials: true** | CORS configuré pour accepter les cookies |
| **Pas de données dans l'URL** | Historique et logs propres |

### Comparaison Avant/Après

| Aspect | ❌ Avant (URL) | ✅ Après (Cookie) |
|--------|---------------|-------------------|
| **Sécurité** | Token visible dans l'URL | Token httpOnly invisible |
| **XSS** | Vulnérable | Protégé |
| **Historique** | Token dans l'historique | Historique propre |
| **Logs** | Token dans les logs | Logs propres |
| **CSRF** | Pas de protection | Protection sameSite |

---

## 📝 Configuration Environnement

Ajouter dans `.env` :

```env
# Frontend URL pour CORS
FRONTEND_URL=http://localhost:3001

# URL de redirection après login Google
REDIRECT_LOGIN_URL=http://localhost:3001

# JWT Secret
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google-redirect
```

---

## 🧪 Test

### 1. Démarrer le backend
```bash
npm run start:dev
```

### 2. Tester l'authentification Google
1. Ouvrir : `http://localhost:3000/auth/google`
2. Se connecter avec Google
3. Redirection vers le dashboard
4. Vérifier dans DevTools > Application > Cookies :
   - `access_token` (httpOnly: true)
   - `user_info` (httpOnly: false)

### 3. Vérifier l'authentification
```bash
curl http://localhost:3000/auth/check \
  --cookie "access_token=your-token-here"
```

---

## 🎯 Avantages de cette Solution

1. ✅ **Sécurité maximale** : Token protégé contre XSS
2. ✅ **Simplicité** : Pas besoin de gérer manuellement le token
3. ✅ **Automatique** : Les cookies sont envoyés automatiquement
4. ✅ **Standards** : Utilise les meilleures pratiques web
5. ✅ **Propre** : URL sans données sensibles

