# Google OAuth Testing Guide

Complete guide to test the Google OAuth authentication flow.

## Prerequisites

Before testing, ensure you have:

1. ✅ Google OAuth credentials (Client ID & Secret) from Google Cloud Console
2. ✅ Backend `.env` file configured with your credentials
3. ✅ Node.js and pnpm installed

## Setup Steps

### 1. Configure Google OAuth Credentials

Follow the detailed instructions in `backend/AUTH_SETUP.md` to:
- Create a Google Cloud project
- Set up OAuth consent screen
- Create OAuth 2.0 credentials
- Configure authorized redirect URIs: `http://localhost:3000/auth/google-redirect`

### 2. Configure Backend

```bash
cd backend

# Create .env file
cat > .env << EOF
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google-redirect
PORT=3000
EOF

# Install dependencies
pnpm install

# Build the project
pnpm run build
```

### 3. Start Backend Server

```bash
cd backend
pnpm run start:dev
```

You should see:
```
[Nest] INFO [NestApplication] Nest application successfully started
```

Backend will be running on `http://localhost:3000`

### 4. Start Frontend Server

Open a new terminal:

```bash
cd frontend
npm install  # or pnpm install
npm run dev  # Frontend will run on port 3001
```

Frontend will be running on `http://localhost:3001`

## Testing the OAuth Flow

### Test 1: Home Page

1. Open your browser to `http://localhost:3001`
2. You should see:
   - ✅ Beautiful hero section with "Google OAuth Demo" title
   - ✅ "Sign In with Google" button
   - ✅ Features section
   - ✅ "How It Works" section
   - ✅ Tech stack showcase

### Test 2: Login Page

1. Click "Sign In with Google" or navigate to `http://localhost:3001/login`
2. You should see:
   - ✅ Clean login interface
   - ✅ Google sign-in button with official Google logo
   - ✅ "How it works" instructions
   - ✅ OAuth 2.0 security badge

### Test 3: Complete OAuth Flow

1. Click the "Continue with Google" button
2. **Expected behavior:**
   - ✅ Button shows loading state ("Redirecting...")
   - ✅ Redirected to Google's consent screen
   - ✅ Google asks you to choose an account
   - ✅ Google shows permission request (email, profile)

3. **Sign in with Google:**
   - Choose your Google account
   - Click "Allow" to grant permissions

4. **After authentication:**
   - ✅ Redirected to `http://localhost:3001/dashboard`
   - ✅ Your profile picture appears
   - ✅ Welcome message with your first name
   - ✅ Profile information displayed:
     - Email address
     - Full name (first + last)
     - Access token (truncated)
     - Refresh token (if available)
   - ✅ OAuth flow status indicators (all green)

### Test 4: Dashboard Features

On the dashboard, verify:

1. **Profile Section:**
   - ✅ Profile picture loads correctly
   - ✅ First name displayed in welcome message
   - ✅ "Successfully authenticated with Google OAuth" message

2. **Information Cards:**
   - ✅ Email address matches your Google account
   - ✅ Full name is correct
   - ✅ Access token shown (truncated for security)
   - ✅ Icons displayed for each field

3. **Success Message:**
   - ✅ Green success banner appears
   - ✅ "User information from google" message

4. **OAuth Status:**
   - ✅ All 4 status indicators are green
   - ✅ Each step is marked as complete

5. **Logout Button:**
   - ✅ Click logout
   - ✅ Redirected to home page

### Test 5: Direct Dashboard Access (Error Handling)

1. Clear browser history/session
2. Navigate directly to `http://localhost:3001/dashboard`
3. **Expected behavior:**
   - ✅ Error page appears
   - ✅ "Authentication Error" message
   - ✅ "No user data found" explanation
   - ✅ "Go to Login" button works

### Test 6: Responsive Design

Test on different screen sizes:

1. **Desktop (1920px+):**
   - ✅ All elements properly spaced
   - ✅ Multi-column layouts work

2. **Tablet (768px - 1024px):**
   - ✅ Layout adjusts appropriately
   - ✅ All content remains accessible

3. **Mobile (320px - 767px):**
   - ✅ Single column layout
   - ✅ Buttons stack vertically
   - ✅ Text remains readable

### Test 7: Dark Mode

Toggle your OS dark mode or browser dark mode:

1. **Light Mode:**
   - ✅ Blue/white color scheme
   - ✅ All text readable

2. **Dark Mode:**
   - ✅ Dark gray/blue color scheme
   - ✅ All text readable
   - ✅ Smooth color transitions

## Testing Backend API Directly

### Test Backend Endpoints

1. **Initiate OAuth:**
   ```bash
   curl http://localhost:3000/auth/google
   ```
   - Should redirect to Google OAuth consent screen

2. **Check Health:**
   ```bash
   curl http://localhost:3000
   ```
   - Should return "Hello World!" (if app controller has default route)

## Common Issues and Solutions

### Issue 1: "Redirect URI Mismatch"

**Symptom:** Error from Google during OAuth flow

**Solution:**
- Go to Google Cloud Console
- Navigate to Credentials
- Ensure `http://localhost:3000/auth/google-redirect` is in authorized redirect URIs
- No trailing slash
- Exact match required

### Issue 2: "Invalid Client"

**Symptom:** Error immediately after clicking sign-in

**Solution:**
- Check `backend/.env` file
- Verify GOOGLE_CLIENT_ID is correct
- Verify GOOGLE_CLIENT_SECRET is correct
- No extra spaces or quotes in .env

### Issue 3: Backend Not Starting

**Symptom:** Backend crashes on start

**Solution:**
```bash
cd backend
rm -rf node_modules dist
pnpm install
pnpm run build
pnpm run start:dev
```

### Issue 4: "No user data found"

**Symptom:** Dashboard shows error after successful Google login

**Solution:**
- Check backend console for errors
- Verify backend is redirecting to correct frontend URL
- Ensure `http://localhost:3001` is correct in `auth.controller.ts`

### Issue 5: Frontend Build Errors

**Symptom:** Frontend won't start

**Solution:**
```bash
cd frontend
rm -rf node_modules .next
npm install  # or pnpm install
npm run dev
```

### Issue 6: Port Already in Use

**Symptom:** "Port 3000 (or 3001) already in use"

**Solution:**
```bash
# Find and kill process on port 3000 (backend)
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

## Verification Checklist

Before considering the setup complete, verify:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Home page loads correctly
- [ ] Login page loads correctly
- [ ] Google OAuth flow completes successfully
- [ ] Dashboard displays user information
- [ ] Logout functionality works
- [ ] Error handling works (direct dashboard access)
- [ ] Responsive design works on mobile
- [ ] Dark mode works correctly

## What You Should See

### Successful OAuth Flow:

```
User Flow:
1. Home (localhost:3001) 
   → Click "Sign In"
2. Login Page (localhost:3001/login)
   → Click "Continue with Google"
3. Backend (localhost:3000/auth/google)
   → Redirects to Google
4. Google OAuth Screen
   → User authenticates
5. Google Callback (localhost:3000/auth/google-redirect)
   → Backend processes
6. Dashboard (localhost:3001/dashboard?user=...)
   → User information displayed
```

### Data Flow:

```
Frontend Login → Backend /auth/google → Google OAuth → 
Backend /auth/google-redirect → Frontend /dashboard
```

## Backend Logs (Successful Flow)

You should see something like:
```
[NestApplication] Nest application successfully started
GoogleStrategy executing validate method
User authenticated: {email: "user@example.com", ...}
Redirecting to frontend dashboard
```

## Next Steps After Testing

Once everything works:

1. **Production Setup:**
   - Update all localhost URLs to production domains
   - Configure production OAuth credentials in Google Cloud
   - Set up environment variables properly
   - Enable HTTPS

2. **Add Features:**
   - User database to persist user data
   - JWT tokens for session management
   - Protected API routes
   - User roles and permissions

3. **Security:**
   - Add CSRF protection
   - Implement rate limiting
   - Set up session management
   - Add refresh token rotation

## Support

If you encounter issues not covered here:
1. Check `backend/AUTH_SETUP.md` for backend-specific issues
2. Check `frontend/FRONTEND_SETUP.md` for frontend-specific issues
3. Review browser console and backend logs
4. Verify all environment variables are set correctly

