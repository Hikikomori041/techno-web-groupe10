# 🚀 Quick Start Guide

Get the Google OAuth demo running in 5 minutes!

## 1. Get Google OAuth Credentials (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Configure OAuth consent screen (just basic info needed for testing)
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/auth/google-redirect`
7. Copy your **Client ID** and **Client Secret**

## 2. Setup Backend (1 minute)

```bash
cd backend

# Create .env file with your credentials
echo "GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE" > .env
echo "GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE" >> .env
echo "GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google-redirect" >> .env
echo "PORT=3000" >> .env

# Install dependencies
pnpm install

# Start the server
pnpm run start:dev
```

**Expected output:**
```
✅ Nest application successfully started
✅ Running on http://localhost:3000
```

## 3. Setup Frontend (1 minute)

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install
# or
pnpm install

# Start the development server (on port 3001)
npm run dev -- -p 3001
```

**Expected output:**
```
✅ Ready on http://localhost:3001
```

## 4. Test It! (30 seconds)

1. Open browser to: **http://localhost:3001**
2. Click **"Sign In with Google"**
3. Choose your Google account
4. Click **"Allow"**
5. 🎉 You should see your profile on the dashboard!

## What You'll See

### Home Page
![Home Page with hero section and features]

### Login Page
![Beautiful login page with Google button]

### Dashboard
![User dashboard with profile info, tokens, and OAuth status]

## Troubleshooting

### ❌ "Redirect URI Mismatch"
**Fix:** Make sure you added `http://localhost:3000/auth/google-redirect` to Google Cloud Console authorized redirect URIs (exact match, no trailing slash)

### ❌ "Invalid Client"
**Fix:** Check your .env file - Client ID and Secret should have no quotes or extra spaces

### ❌ Port Already in Use
**Fix:** 
```bash
# Kill process on port 3000 or 3001
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -ti:3000 | xargs kill -9
```

## Architecture

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend      │         │   Backend    │         │   Google    │
│  (Next.js)      │         │  (NestJS)    │         │   OAuth     │
│  Port 3001      │         │  Port 3000   │         │             │
└────────┬────────┘         └──────┬───────┘         └──────┬──────┘
         │                         │                        │
         │ 1. Click Login          │                        │
         ├────────────────────────>│                        │
         │                         │ 2. Redirect to Google  │
         │                         ├───────────────────────>│
         │                         │                        │
         │                         │     3. User Sign In    │
         │                         │<───────────────────────┤
         │                         │                        │
         │  4. Redirect + User Data│                        │
         │<────────────────────────┤                        │
         │                         │                        │
         │ 5. Show Dashboard       │                        │
         │                         │                        │
```

## File Structure

```
.
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts    # OAuth routes
│   │   │   ├── auth.service.ts       # Auth logic
│   │   │   ├── auth.module.ts        # Module config
│   │   │   ├── guards/
│   │   │   │   └── google-oauth.guard.ts
│   │   │   └── helpers/
│   │   │       └── google.strategy.ts # Passport strategy
│   │   └── app.module.ts              # Root module
│   ├── .env                           # Your credentials ← CREATE THIS
│   └── AUTH_SETUP.md                  # Detailed backend guide
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx               # Home page
│   │       ├── login/
│   │       │   └── page.tsx           # Login page
│   │       └── dashboard/
│   │           ├── page.tsx           # Dashboard wrapper
│   │           └── DashboardContent.tsx
│   └── FRONTEND_SETUP.md              # Detailed frontend guide
│
├── TESTING_GUIDE.md                   # Complete testing guide
└── QUICK_START.md                     # This file
```

## Key Endpoints

### Backend (Port 3000)
- `GET /auth/google` - Initiates OAuth flow
- `GET /auth/google-redirect` - OAuth callback

### Frontend (Port 3001)
- `/` - Home page
- `/login` - Login page
- `/dashboard` - User dashboard (after auth)

## Next Steps

✅ **It's working!** Now what?

1. **Add a database** - Store user data
2. **Add JWT tokens** - Session management
3. **Add protected routes** - Require authentication
4. **Deploy to production** - Update URLs and credentials

## Need More Help?

- 📖 **Backend Details:** See `backend/AUTH_SETUP.md`
- 📖 **Frontend Details:** See `frontend/FRONTEND_SETUP.md`
- 📖 **Complete Testing:** See `TESTING_GUIDE.md`

## Features Implemented

✅ Google OAuth 2.0 authentication
✅ NestJS backend with Passport.js
✅ Next.js 15 frontend with App Router
✅ Beautiful, responsive UI with Tailwind CSS
✅ Dark mode support
✅ TypeScript throughout
✅ Error handling
✅ Loading states
✅ Secure token handling
✅ Profile picture display
✅ User information extraction

## Technologies

- **Backend:** NestJS, Passport.js, TypeScript
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Auth:** Google OAuth 2.0, passport-google-oauth20
- **Package Manager:** pnpm (backend), npm (frontend)

---

**Happy coding! 🎉**

If you found this helpful, consider starring the repo and sharing with others!

