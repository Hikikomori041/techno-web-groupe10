# JWT Authentication Guide

Complete guide for using email/password authentication with JWT tokens.

## 🎯 Overview

Your application now supports **TWO authentication methods**:
1. **Google OAuth** - Social login with Google
2. **JWT with Email/Password** - Traditional registration and login

## 📋 Backend API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login with email/password | No |
| GET | `/auth/profile` | Get user profile | Yes (JWT) |
| GET | `/auth/google` | Initiate Google OAuth | No |
| GET | `/auth/google-redirect` | Google OAuth callback | No |

### 1. Register New User

**POST** `http://localhost:3000/auth/register`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "1234567890",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "provider": "local",
    "createdAt": "2025-10-08T12:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

**POST** `http://localhost:3000/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "1234567890",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "provider": "local",
    "createdAt": "2025-10-08T12:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get Profile (Protected Route)

**GET** `http://localhost:3000/auth/profile`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "id": "1234567890",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "provider": "local",
  "createdAt": "2025-10-08T12:00:00.000Z"
}
```

## 🌐 Frontend Pages

### 1. Register Page (`/register`)

Features:
- Email and password input
- First name and last name
- Form validation
- Error handling
- Link to login page
- Option to sign up with Google

### 2. Login Page (`/login`)

Features:
- **Two login options:**
  - Google OAuth (default)
  - Email/Password (toggle)
- Switch between methods
- Error handling
- Link to register page

### 3. Dashboard (`/dashboard`)

Shows user information after successful authentication (works for both methods)

## 🔑 Environment Variables

Add to your `backend/.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google-redirect

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Application Configuration
PORT=3000
```

## 🚀 How to Test

### Test JWT Authentication:

#### 1. **Register a new user**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### 2. **Login**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Copy the `access_token` from the response.

#### 3. **Access protected route**

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Frontend:

1. **Start backend:**
   ```bash
   cd backend
   pnpm run start:dev
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm run dev -- -p 3001
   ```

3. **Test Registration:**
   - Go to `http://localhost:3001/register`
   - Fill in the form
   - Click "Create Account"
   - You should be redirected to dashboard

4. **Test Login:**
   - Go to `http://localhost:3001/login`
   - Click "Sign in with Email"
   - Enter your credentials
   - You should be redirected to dashboard

5. **Test Google OAuth:**
   - Go to `http://localhost:3001/login`
   - Click "Continue with Google"
   - Complete Google OAuth flow

## 🔒 Security Features

### Password Hashing
- Passwords are hashed using **bcrypt** with salt rounds = 10
- Plain text passwords are never stored

### JWT Tokens
- Signed with HS256 algorithm
- Expires in 7 days (configurable)
- Contains user ID, email, and name

### Validation
- Email format validation
- Password minimum length (6 characters)
- Required fields enforcement
- Type validation with class-validator

### CORS
- Enabled for `http://localhost:3001`
- Credentials supported

## 📦 Backend Structure

```
backend/src/auth/
├── dto/
│   ├── register.dto.ts      # Registration validation
│   └── login.dto.ts          # Login validation
├── entities/
│   └── user.entity.ts        # User interface
├── guards/
│   ├── google-oauth.guard.ts # Google OAuth guard
│   └── jwt-auth.guard.ts     # JWT authentication guard
├── strategies/
│   └── jwt.strategy.ts       # JWT Passport strategy
├── helpers/
│   └── google.strategy.ts    # Google OAuth strategy
├── auth.controller.ts        # Auth endpoints
├── auth.service.ts           # Auth business logic
└── auth.module.ts            # Auth module configuration
```

## 🎨 Frontend Structure

```
frontend/src/app/
├── login/
│   └── page.tsx              # Login page (Google + Email)
├── register/
│   └── page.tsx              # Registration page
└── dashboard/
    ├── page.tsx              # Dashboard wrapper
    └── DashboardContent.tsx  # Dashboard content
```

## 💾 Data Storage

### Backend
- **In-memory storage** (for development)
- Users are stored in an array
- ⚠️ **Data is lost when server restarts**

### Production Recommendations
Replace in-memory storage with:
- **PostgreSQL** with TypeORM
- **MongoDB** with Mongoose
- **MySQL** with TypeORM

### Frontend
- JWT token stored in `localStorage`
- User data stored in `localStorage`
- ⚠️ **Clear on logout**

## 🔐 Protected Routes Example

To protect a route with JWT:

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('api')
export class ApiController {
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  getProtectedData(@Request() req) {
    return {
      message: 'This is protected data',
      user: req.user, // User info from JWT
    };
  }
}
```

## 🛠️ Frontend Usage

### Storing Token After Login

```typescript
// After successful login/register
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('user', JSON.stringify(data.user));
```

### Making Authenticated Requests

```typescript
const token = localStorage.getItem('access_token');

const response = await fetch('http://localhost:3000/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

### Logout

```typescript
localStorage.removeItem('access_token');
localStorage.removeItem('user');
window.location.href = '/';
```

## ⚠️ Important Notes

### Development vs Production

**Development (Current):**
- In-memory user storage
- Data resets on server restart
- Simple JWT secret
- HTTP localhost URLs

**Production (Required):**
- Database integration
- Persistent user storage
- Strong JWT secret (use crypto.randomBytes)
- HTTPS URLs
- Refresh tokens
- Token blacklisting
- Rate limiting
- Password reset functionality

### Security Checklist for Production

- [ ] Use database for user storage
- [ ] Generate strong JWT secret
- [ ] Implement refresh tokens
- [ ] Add password reset functionality
- [ ] Enable rate limiting
- [ ] Use HTTPS everywhere
- [ ] Implement token blacklisting
- [ ] Add 2FA (optional)
- [ ] Hash tokens in database
- [ ] Set secure cookie options
- [ ] Implement CSRF protection
- [ ] Add email verification

## 🐛 Troubleshooting

### "Email already exists"
- The email is already registered
- Try logging in instead or use a different email

### "Invalid credentials"
- Email or password is incorrect
- Check for typos
- Passwords are case-sensitive

### "Unauthorized"
- JWT token is missing or invalid
- Token may have expired
- Login again to get a new token

### CORS Errors
- Backend must be running on port 3000
- Frontend must be running on port 3001
- Check CORS configuration in `main.ts`

## 📚 Next Steps

1. **Add Database:**
   - Install TypeORM or Prisma
   - Create User entity
   - Replace in-memory storage

2. **Add Refresh Tokens:**
   - Extend JWT module
   - Add refresh endpoint
   - Store refresh tokens

3. **Add Email Verification:**
   - Send verification email
   - Create verification endpoint
   - Update user entity

4. **Add Password Reset:**
   - Send reset email
   - Create reset token
   - Update password endpoint

5. **Improve Security:**
   - Add rate limiting
   - Implement token blacklisting
   - Add 2FA

## 📖 API Testing with Postman

### Collection Setup

1. Create a new collection "Auth API"
2. Add environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `token`: (will be set after login)

### Requests

**1. Register:**
- Method: POST
- URL: `{{baseUrl}}/auth/register`
- Body: JSON with email, password, firstName, lastName

**2. Login:**
- Method: POST
- URL: `{{baseUrl}}/auth/login`
- Body: JSON with email, password
- Test Script: `pm.environment.set("token", pm.response.json().access_token);`

**3. Get Profile:**
- Method: GET
- URL: `{{baseUrl}}/auth/profile`
- Header: `Authorization: Bearer {{token}}`

---

**Authentication Complete! 🎉**

You now have a full-featured authentication system with both OAuth and JWT!

