# Module Structure Documentation

Complete overview of the modular architecture.

## 📦 Module Organization

The application is organized into **separate, focused modules**:

### 1. Auth Module (`/auth`)
**Purpose:** Authentication and authorization

**Endpoints:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `GET /auth/profile` - Get current user profile (JWT required)
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google-redirect` - Google OAuth callback

**Responsibilities:**
- User registration
- User login
- JWT token generation
- Google OAuth integration
- User authentication
- Profile retrieval

### 2. Users Module (`/users`)
**Purpose:** User management (Admin only)

**Endpoints:**
- `GET /users` - Get all users (Admin)
- `GET /users/:id` - Get user by ID (Admin)
- `PUT /users/:id/role` - Update user roles (Admin)
- `DELETE /users/:id` - Delete user (Admin)

**Responsibilities:**
- User listing
- User details
- Role management
- User deletion

## 🏗️ Module Structure

### Auth Module
```
src/auth/
├── decorators/
│   └── roles.decorator.ts       # @Roles() decorator
├── dto/
│   ├── login.dto.ts             # Login validation
│   ├── register.dto.ts          # Registration validation
│   └── update-role.dto.ts       # Role update validation
├── entities/
│   └── user.entity.ts           # User interface
├── enums/
│   └── role.enum.ts             # USER, ADMIN, MODERATOR
├── guards/
│   ├── google-oauth.guard.ts    # Google OAuth guard
│   ├── jwt-auth.guard.ts        # JWT authentication
│   └── roles.guard.ts           # Role authorization
├── strategies/
│   ├── google.strategy.ts       # Google OAuth strategy
│   └── jwt.strategy.ts          # JWT strategy
├── auth.controller.ts           # Auth endpoints
├── auth.service.ts              # Auth business logic
├── auth.module.ts               # Module configuration
└── auth.swagger.ts              # Swagger documentation
```

### Users Module
```
src/users/
├── users.controller.ts          # User management endpoints
├── users.service.ts             # User management logic
├── users.module.ts              # Module configuration
└── users.swagger.ts             # Swagger documentation
```

## 🔄 Module Dependencies

```
AppModule
├── ConfigModule (global)
├── AuthModule
│   ├── PassportModule
│   ├── JwtModule
│   └── Exports: AuthService, RolesGuard
└── UsersModule
    └── Imports: AuthModule
```

## 🎯 Separation of Concerns

### Auth Module - "Who are you?"
- Registration
- Login
- Token generation
- Authentication strategies
- Profile access

### Users Module - "What can you manage?"
- User listing
- User details
- Role assignment
- User deletion
- Admin operations

## 📋 API Endpoints Overview

### Authentication (`/auth`)
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/auth/register` | ❌ | - | Register |
| POST | `/auth/login` | ❌ | - | Login |
| GET | `/auth/profile` | ✅ | Any | Get profile |
| GET | `/auth/google` | ❌ | - | OAuth start |
| GET | `/auth/google-redirect` | ❌ | - | OAuth callback |

### User Management (`/users`)
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/users` | ✅ | ADMIN | Get all users |
| GET | `/users/:id` | ✅ | ADMIN | Get user by ID |
| PUT | `/users/:id/role` | ✅ | ADMIN | Update roles |
| DELETE | `/users/:id` | ✅ | ADMIN | Delete user |

## 🔐 Security Architecture

### Guards Applied at Different Levels

**Auth Module:**
- `JwtAuthGuard` - Protects `/auth/profile`
- `GoogleOAuthGuard` - Protects OAuth routes

**Users Module:**
- `JwtAuthGuard` - Authenticates user
- `RolesGuard` - Checks ADMIN role
- Both applied to entire controller

## 🎨 Swagger Documentation

In Swagger UI (`http://localhost:3000/api`), you'll see:

### Grouped by Tags

**auth** (Authentication)
- Registration
- Login
- Profile
- Google OAuth

**users** (User Management)
- List users
- Get user
- Update roles
- Delete user

## 💡 Benefits of This Structure

### 1. **Separation of Concerns**
- Auth handles authentication
- Users handles user management
- Clear boundaries

### 2. **Scalability**
- Easy to add more modules
- Independent development
- Clear dependencies

### 3. **Maintainability**
- Each module has single responsibility
- Easy to locate code
- Simple to test

### 4. **Reusability**
- AuthService exported and reused
- Guards shared across modules
- DTOs and entities reused

## 🚀 Adding New Modules

### Example: Products Module

```typescript
// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],  // Import for guards
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}

// src/products/products.controller.ts
@Controller('products')
export class ProductsController {
  
  @Get()
  findAll() {
    return []; // Public endpoint
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create() {
    return {}; // Admin only
  }
}
```

Then add to `app.module.ts`:
```typescript
imports: [
  ConfigModule.forRoot(...),
  AuthModule,
  UsersModule,
  ProductsModule,  // Add new module
]
```

## 📚 Module Communication

### Users Module Uses Auth Module

```typescript
// users.service.ts
export class UsersService {
  constructor(private authService: AuthService) {}  // ✅ Injected
  
  async findAll() {
    return this.authService.getAllUsers();  // ✅ Uses auth service
  }
}
```

### Why This Works

1. `AuthModule` exports `AuthService`
2. `UsersModule` imports `AuthModule`
3. `UsersService` can inject `AuthService`

## 🧪 Testing Modules Separately

### Test Auth Module
```bash
# Register
curl -X POST http://localhost:3000/auth/register -d {...}

# Login
curl -X POST http://localhost:3000/auth/login -d {...}

# Profile
curl -X GET http://localhost:3000/auth/profile -H "Authorization: Bearer ..."
```

### Test Users Module
```bash
# Get all (admin only)
curl -X GET http://localhost:3000/users -H "Authorization: Bearer ADMIN_TOKEN"

# Get by ID (admin only)
curl -X GET http://localhost:3000/users/123 -H "Authorization: Bearer ADMIN_TOKEN"

# Update role (admin only)
curl -X PUT http://localhost:3000/users/123/role -d {...}

# Delete (admin only)
curl -X DELETE http://localhost:3000/users/123
```

## 📁 File Organization

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Application bootstrap
├── auth/                      # Authentication module
│   ├── decorators/
│   ├── dto/
│   ├── entities/
│   ├── enums/
│   ├── guards/
│   ├── strategies/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── auth.swagger.ts
└── users/                     # User management module
    ├── users.controller.ts
    ├── users.service.ts
    ├── users.module.ts
    └── users.swagger.ts
```

## 🎯 Key Principles

### 1. Single Responsibility
- Each module has one clear purpose
- Auth = Authentication
- Users = User Management

### 2. Encapsulation
- Internal logic hidden
- Only expose what's needed via exports

### 3. Dependency Injection
- Services injected where needed
- Guards shared across modules
- Clean dependencies

### 4. Documentation Separation
- Each module has own swagger file
- Clean controllers
- Easy to maintain

## 🔧 Environment Variables

Add to `.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google-redirect

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Frontend URL
REDIRECT_LOGIN_URL=http://localhost:3001

# Port
PORT=3000
```

## ✅ What Changed

**Before:** All endpoints in `/auth`
```
/auth/register
/auth/login
/auth/profile
/auth/users              ← User management in auth
/auth/users/:id/role     ← User management in auth
/auth/users/:id          ← User management in auth
```

**After:** Separated by concern
```
Auth Module (/auth):
  /auth/register         ✅ Authentication
  /auth/login            ✅ Authentication
  /auth/profile          ✅ Authentication
  /auth/google           ✅ Authentication
  /auth/google-redirect  ✅ Authentication

Users Module (/users):
  /users                 ✅ User management
  /users/:id             ✅ User management
  /users/:id/role        ✅ User management
  /users/:id             ✅ User management (delete)
```

## 🌟 Benefits

✅ **Clear API structure** - Easy to understand
✅ **Better organization** - Logical separation
✅ **Easier maintenance** - Changes isolated to modules
✅ **Scalable** - Easy to add more modules
✅ **Testable** - Test modules independently

---

**Your application now has a clean, modular architecture!** 🎉

Check Swagger at `http://localhost:3000/api` to see the organized API documentation!

