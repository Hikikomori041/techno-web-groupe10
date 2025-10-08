# Frontend Setup Guide

This guide will help you set up and run the Next.js frontend for testing Google OAuth authentication.

## Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- Backend server running on `http://localhost:3000`

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

## Running the Application

Start the development server:

```bash
npm run dev
# or
pnpm run dev
```

The frontend will be available at `http://localhost:3001`

## Application Structure

### Pages

- **`/`** - Home page with features and "Sign In with Google" button
- **`/login`** - Dedicated login page with Google OAuth button
- **`/dashboard`** - User dashboard showing authenticated user information

### How It Works

1. User clicks "Sign In with Google" on the home or login page
2. User is redirected to `http://localhost:3000/auth/google` (backend)
3. Backend redirects to Google's OAuth consent screen
4. User authenticates with Google and grants permissions
5. Google redirects to `http://localhost:3000/auth/google-redirect` (backend callback)
6. Backend processes the OAuth response and redirects to `http://localhost:3001/dashboard` with user data
7. Dashboard displays user profile information

## Features

### Home Page (`/`)
- Beautiful hero section with project description
- Feature cards highlighting key benefits
- "How It Works" section explaining the OAuth flow
- Tech stack showcase
- Responsive design with dark mode support

### Login Page (`/login`)
- Clean, focused login interface
- Google OAuth button with proper branding
- Loading states during authentication
- Info section explaining the process
- Security badge (OAuth 2.0)

### Dashboard (`/dashboard`)
- User profile picture and name
- Detailed user information display:
  - Email address
  - Full name
  - Access token (truncated)
  - Refresh token (if available)
- OAuth flow status indicators
- Logout functionality

## UI Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Dark Mode**: Full dark mode support
- **Beautiful UI**: Modern design with Tailwind CSS
- **Loading States**: Proper loading indicators during async operations
- **Error Handling**: User-friendly error messages
- **Accessibility**: Semantic HTML and ARIA labels

## Configuration

### Port Configuration

The frontend runs on port `3001` by default. To change this, modify the `dev` script in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack -p 3001"
  }
}
```

### Backend URL

The backend URL is hardcoded to `http://localhost:3000` in:
- `src/app/login/page.tsx` - For initiating OAuth
- Backend's `auth.controller.ts` - For redirect URL

If you change the backend port, update both locations.

## Troubleshooting

### Port Already in Use

If port 3001 is already in use, either:
1. Stop the process using port 3001
2. Change the port in package.json: `"dev": "next dev --turbopack -p 3002"`

### Cannot Connect to Backend

Ensure:
1. Backend is running on `http://localhost:3000`
2. Backend has Google OAuth credentials configured
3. No CORS issues (NestJS should have CORS enabled)

### Dashboard Shows "No User Data"

This happens if:
1. You navigate directly to `/dashboard` without logging in
2. The OAuth flow was interrupted
3. Backend failed to redirect properly

Solution: Go back to `/login` and sign in again

## Development Tips

### Testing the Flow

1. Open `http://localhost:3001` in your browser
2. Click "Sign In with Google"
3. Complete the Google OAuth flow
4. Verify you see your profile on the dashboard

### Modifying Styles

All styles use Tailwind CSS. To modify:
- Edit `src/app/globals.css` for global styles
- Use Tailwind classes directly in components
- Dark mode variants are available with `dark:` prefix

### Adding New Pages

Create a new folder in `src/app/`:
```
src/app/
  your-page/
    page.tsx
```

## Production Deployment

Before deploying to production:

1. Update all localhost URLs to production URLs:
   - In `src/app/login/page.tsx`
   - In backend's `auth.controller.ts`

2. Update Google OAuth redirect URIs in Google Cloud Console

3. Build the application:
   ```bash
   npm run build
   npm start
   ```

4. Set up proper environment variables for API URLs

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS 4**: Utility-first CSS framework
- **React 19**: Latest React features

## Support

For issues or questions:
1. Check the backend setup guide (`backend/AUTH_SETUP.md`)
2. Verify Google OAuth credentials are configured
3. Check browser console for errors
4. Ensure backend and frontend are both running

