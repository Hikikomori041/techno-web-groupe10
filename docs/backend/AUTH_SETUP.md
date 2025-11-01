# Google OAuth Authentication Setup

This guide will help you set up Google OAuth authentication for your NestJS application.

## Prerequisites

- Node.js installed
- A Google Cloud Platform account
- pnpm package manager

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application** as the application type
6. Configure the OAuth consent screen if prompted
7. Add the following to **Authorized redirect URIs**:
   ```
   http://localhost:3000/auth/google-redirect
   ```
8. Click **Create**
9. Copy your **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

1. Create a `.env` file in the `backend` directory:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Google OAuth credentials:
   ```env
   GOOGLE_CLIENT_ID=your_actual_google_client_id
   GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google-redirect
   PORT=3000
   ```

## Step 3: Install Dependencies

```bash
pnpm install
```

## Step 4: Run the Application

```bash
pnpm run start:dev
```

## Testing the Authentication Flow

1. Start your backend server (it should be running on `http://localhost:3000`)

2. Open your browser and navigate to:
   ```
   http://localhost:3000/auth/google
   ```

3. You will be redirected to Google's OAuth consent screen

4. After successful authentication, you will be redirected to:
   ```
   http://localhost:3000/auth/google-redirect
   ```

5. You should see a JSON response with your user information:
   ```json
   {
     "message": "User information from google",
     "user": {
       "email": "your.email@example.com",
       "firstName": "John",
       "lastName": "Doe",
       "picture": "https://lh3.googleusercontent.com/...",
       "accessToken": "...",
       "refreshToken": "..."
     }
   }
   ```

## API Endpoints

### `GET /auth/google`
Initiates the Google OAuth flow. Redirects the user to Google's consent screen.

### `GET /auth/google-redirect`
Callback endpoint where Google redirects after authentication. Returns user information.

## Architecture

The authentication system consists of:

- **GoogleStrategy**: Passport strategy that handles the OAuth flow with Google
- **GoogleOAuthGuard**: Guard that protects routes and ensures authentication
- **AuthService**: Service that processes the authenticated user data
- **AuthController**: Controller that exposes the authentication endpoints

## Security Notes

- Never commit your `.env` file to version control
- Keep your Google Client Secret secure
- In production, update the `GOOGLE_CALLBACK_URL` to your production domain
- Consider adding session management or JWT tokens for maintaining user authentication state

## Next Steps

After successful authentication, you may want to:

1. Store user information in a database
2. Implement JWT tokens for session management
3. Add user roles and permissions
4. Create protected routes using authentication guards
5. Integrate with your frontend application

## Troubleshooting

### "Redirect URI mismatch" error
- Ensure the redirect URI in your `.env` matches exactly what you configured in Google Cloud Console
- Check for typos (including trailing slashes)

### "Invalid client" error
- Verify your Client ID and Client Secret are correct
- Make sure there are no extra spaces in your `.env` file

### "Access blocked" error
- Configure your OAuth consent screen in Google Cloud Console
- Add test users if your app is in testing mode

