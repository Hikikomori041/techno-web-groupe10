# Role-Based Access Control (RBAC) Guide

Complete guide for using role-based authorization in your application.

## 🎭 Available Roles

```typescript
enum Role {
  USER = 'user',        // Default role for all users
  ADMIN = 'admin',      // Full access to everything
  MODERATOR = 'moderator' // Moderate permissions
}
```

## 🔑 Default Admin Account

A default admin account is automatically created on server start:

```
Email: admin@example.com
Password: admin123
Roles: [ADMIN, USER]
```

## 🛡️ Protected Routes

### Public Routes (No authentication)
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/google`
- `GET /auth/google-redirect`

### User Routes (JWT required)
- `GET /auth/profile` - Any authenticated user

### Admin Routes (JWT + ADMIN role required)
- `GET /auth/users` - Get all users
- `PUT /auth/users/:id/role` - Update user roles
- `DELETE /auth/users/:id` - Delete user

## 📋 API Endpoints

### 1. Get All Users (Admin Only)

**GET** `http://localhost:3000/auth/users`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

**Response:**
```json
[
  {
    "id": "admin-001",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "provider": "local",
    "roles": ["admin", "user"],
    "createdAt": "2025-10-08T12:00:00.000Z"
  },
  {
    "id": "1234567890",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "provider": "local",
    "roles": ["user"],
    "createdAt": "2025-10-08T12:00:00.000Z"
  }
]
```

### 2. Update User Role (Admin Only)

**PUT** `http://localhost:3000/auth/users/:id/role`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

**Request Body:**
```json
{
  "roles": ["user", "moderator"]
}
```

**Response:**
```json
{
  "id": "1234567890",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "provider": "local",
  "roles": ["user", "moderator"],
  "createdAt": "2025-10-08T12:00:00.000Z"
}
```

### 3. Delete User (Admin Only)

**DELETE** `http://localhost:3000/auth/users/:id`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

## 🧪 Testing with cURL

### 1. Login as Admin

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Copy the `access_token` from the response.

### 2. Get All Users

```bash
curl -X GET http://localhost:3000/auth/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Update User Role

```bash
curl -X PUT http://localhost:3000/auth/users/USER_ID_HERE/role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roles": ["user", "moderator"]
  }'
```

### 4. Delete User

```bash
curl -X DELETE http://localhost:3000/auth/users/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🔧 How to Use Roles in Your Code

### Protect a Route with Roles

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { Role } from './auth/enums/role.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)  // 1. Apply both guards
export class AdminController {
  
  @Get('dashboard')
  @Roles(Role.ADMIN)  // 2. Require ADMIN role
  getAdminDashboard() {
    return { message: 'Admin dashboard data' };
  }

  @Get('moderate')
  @Roles(Role.ADMIN, Role.MODERATOR)  // 3. Allow multiple roles
  getModerationPanel() {
    return { message: 'Moderation panel' };
  }
}
```

### Access User Info in Route Handler

```typescript
@Get('my-data')
@UseGuards(JwtAuthGuard)
getMyData(@Request() req) {
  console.log(req.user.userId);   // User ID
  console.log(req.user.email);    // Email
  console.log(req.user.roles);    // ['user'] or ['admin', 'user']
  
  return req.user;
}
```

### Check Roles in Service

```typescript
@Injectable()
export class SomeService {
  doSomething(user: any) {
    if (user.roles.includes(Role.ADMIN)) {
      // Admin-specific logic
    } else {
      // Regular user logic
    }
  }
}
```

## 📊 Role Hierarchy

```
ADMIN
  ├─ Can do everything
  ├─ Manage all users
  ├─ Update user roles
  └─ Delete users

MODERATOR
  ├─ Moderate content
  └─ View user data

USER
  └─ Basic access
```

## 🎨 Frontend Integration

### Store Roles After Login

```typescript
// After login/register
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();

// Store token and user data
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('user', JSON.stringify(data.user));
```

### Check Roles in Frontend

```typescript
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (user.roles?.includes('admin')) {
  // Show admin panel
} else {
  // Hide admin features
}
```

### Make Authenticated Requests

```typescript
const token = localStorage.getItem('access_token');

const response = await fetch('http://localhost:3000/auth/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## 🔐 Security Features

### 1. JWT Token Contains Roles
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["user", "admin"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 2. Roles Guard
- Checks if user has required role
- Returns 403 Forbidden if no access
- Works with JWT authentication

### 3. Multiple Role Assignment
- Users can have multiple roles
- Example: `["user", "admin"]` or `["user", "moderator"]`

## 🚀 Quick Test

### Step 1: Login as Admin

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Step 2: Get All Users (Should work)

```bash
curl -X GET http://localhost:3000/auth/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Step 3: Register Regular User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "Regular",
    "lastName": "User"
  }'
```

### Step 4: Try to Get Users as Regular User (Should fail with 403)

```bash
curl -X GET http://localhost:3000/auth/users \
  -H "Authorization: Bearer USER_TOKEN"
```

**Expected:** `403 Forbidden`

## 📝 Role Assignment Flow

### When User Registers
1. User provides email, password, name
2. System creates user with `roles: [Role.USER]`
3. User gets JWT with their role

### Admin Updates Role
1. Admin calls `PUT /auth/users/:id/role`
2. Provides new roles array
3. User's roles are updated
4. User must login again to get new JWT with updated roles

## ⚠️ Important Notes

### Production Considerations

1. **Database Storage:**
   - Current: In-memory (resets on restart)
   - Production: Use database with role column

2. **Role Validation:**
   - Validate roles before assignment
   - Prevent privilege escalation

3. **Audit Logging:**
   - Log all role changes
   - Track who made changes

4. **Default Admin:**
   - Change default admin credentials
   - Or remove auto-creation in production

## 🎯 Common Use Cases

### Example 1: Blog System
- `USER` - Can read and comment
- `MODERATOR` - Can delete comments
- `ADMIN` - Can manage everything

### Example 2: E-commerce
- `USER` - Can shop and order
- `MODERATOR` - Can handle support tickets
- `ADMIN` - Can manage products and users

### Example 3: Your Current System
- `USER` - Standard access
- `MODERATOR` - Can moderate content
- `ADMIN` - Full system access

## 📚 Additional Resources

### Swagger Documentation
Visit `http://localhost:3000/api` to see:
- All role-protected endpoints
- Try them with different tokens
- See 403 errors for unauthorized access

### Testing in Swagger
1. Login as admin → Get token
2. Click "Authorize" → Enter token
3. Try admin endpoints → Should work
4. Login as regular user → Get token
5. Try admin endpoints → Should get 403

---

**Role management is now complete!** 🎉

Use Swagger at `http://localhost:3000/api` to test all endpoints!

