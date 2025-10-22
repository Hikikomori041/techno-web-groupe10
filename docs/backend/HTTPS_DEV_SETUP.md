# 🔒 Configuration HTTPS en Développement

## ⚠️ Problème

Avec `secure: true` sur les cookies, ils ne fonctionneront **QUE sur HTTPS**.

En développement local (HTTP), les cookies ne seront **PAS envoyés**.

---

## ✅ Solutions

### Option 1: Utiliser un Reverse Proxy (RECOMMANDÉ)

#### A. Avec Caddy (Le plus simple)

**1. Installer Caddy**
```bash
# Windows (avec Chocolatey)
choco install caddy

# macOS
brew install caddy

# Linux
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo apt-key add -
sudo apt update
sudo apt install caddy
```

**2. Créer `Caddyfile` à la racine du projet**
```
localhost {
    reverse_proxy /api/* localhost:3000
    reverse_proxy /* localhost:3001
}
```

**3. Démarrer Caddy**
```bash
caddy run
```

**4. Accéder à l'application**
```
https://localhost
```

✅ **Caddy génère automatiquement un certificat SSL local**

---

#### B. Avec NGINX

**1. Installer NGINX**

**2. Configuration NGINX**
```nginx
server {
    listen 443 ssl;
    server_name localhost;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### Option 2: Modifier Temporairement pour le Dev (MOINS SÉCURISÉ)

Si vous ne pouvez pas configurer HTTPS en dev, modifiez temporairement :

**backend/src/modules/auth/auth.controller.ts**
```typescript
res.cookie('access_token', access_token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // ⚠️ HTTP OK en dev
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
});
```

**⚠️ IMPORTANT:** En production, TOUJOURS utiliser HTTPS avec `secure: true` !

---

### Option 3: Certificat Auto-Signé

**1. Générer un certificat SSL**
```bash
# Créer un dossier certs
mkdir certs
cd certs

# Générer le certificat
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout localhost-key.pem \
  -out localhost.pem \
  -subj "/CN=localhost"
```

**2. Configurer NestJS**

**backend/src/main.ts**
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const httpsOptions = process.env.NODE_ENV === 'development' ? {
    key: fs.readFileSync(path.join(__dirname, '../certs/localhost-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certs/localhost.pem')),
  } : undefined;

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  // ... reste de la config
}
```

**3. Accepter le certificat dans le navigateur**
- Aller sur `https://localhost:3000`
- Cliquer sur "Avancé" > "Continuer vers le site"

---

## 🔧 Configuration Recommandée par Environnement

### Développement Local

**Option A (Recommandée):**
```
Caddy → HTTPS (localhost) → Backend (HTTP :3000) + Frontend (HTTP :3001)
```

**Option B (Acceptable):**
```typescript
secure: process.env.NODE_ENV === 'production'
```

### Staging/Production

**TOUJOURS:**
```typescript
secure: true  // ✅ Obligatoire
sameSite: 'strict'  // ✅ Maximum sécurité
```

---

## 🧪 Vérifier la Configuration

### 1. Vérifier que HTTPS fonctionne
```bash
curl -k https://localhost
```

### 2. Vérifier les cookies
1. Ouvrir DevTools (F12)
2. Application > Cookies
3. Vérifier :
   - ✅ `access_token` présent
   - ✅ `Secure` = true (si HTTPS)
   - ✅ `HttpOnly` = true
   - ✅ `SameSite` = Strict

### 3. Tester l'authentification
```bash
# Login
curl -k -X POST https://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  -c cookies.txt

# Vérifier auth avec le cookie
curl -k https://localhost/api/auth/check \
  -b cookies.txt
```

---

## 📋 Variables d'Environnement

**backend/.env**
```env
# Development
NODE_ENV=development
PORT=3000
FRONTEND_URL=https://localhost  # ✅ HTTPS en dev avec Caddy

# Production
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://votredomaine.com
```

**frontend/.env.local**
```env
# Development avec Caddy
NEXT_PUBLIC_API_URL=https://localhost/api

# Ou sans Caddy (HTTP en dev)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🚀 Démarrage Rapide avec Caddy

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Caddy (à la racine)
caddy run

# Accéder à l'app
# https://localhost
```

---

## ❌ Erreurs Communes

### "Cookie not sent"
**Cause:** `secure: true` mais vous utilisez HTTP

**Solution:** 
- Utiliser HTTPS avec Caddy
- OU mettre `secure: false` en dev (moins sécurisé)

### "CORS error"
**Cause:** Frontend et Backend sur des ports différents

**Solution:** 
- Utiliser un reverse proxy (Caddy/NGINX)
- OU configurer CORS correctement avec les bons origins

### "Certificate not trusted"
**Cause:** Certificat auto-signé

**Solution:**
- Accepter manuellement dans le navigateur
- OU utiliser Caddy qui génère un certificat local de confiance

---

## 📚 Ressources

- [Caddy Documentation](https://caddyserver.com/docs/)
- [HTTPS en développement - MDN](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)
- [SameSite Cookies](https://web.dev/samesite-cookies-explained/)

---

## ✅ Checklist

- [ ] HTTPS configuré en développement (Caddy recommandé)
- [ ] `secure: true` dans les cookies
- [ ] `sameSite: 'strict'` dans les cookies
- [ ] `httpOnly: true` dans les cookies
- [ ] Aucune donnée utilisateur dans les cookies
- [ ] Aucun localStorage utilisé pour l'auth
- [ ] CORS configuré avec `credentials: true`
- [ ] Frontend utilise `credentials: 'include'`

