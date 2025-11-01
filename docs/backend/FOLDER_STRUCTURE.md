# Backend Folder Structure

## New Organized Structure

```
src/
├── modules/                    # Feature modules (domain-driven design)
│   ├── auth/                  # Authentication & Authorization
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── guards/           # Auth guards (JWT, OAuth, Roles)
│   │   ├── strategies/       # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   └── index.ts          # Module exports
│   │
│   ├── users/                 # User management
│   │   ├── schemas/          # User database schema
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── index.ts
│   │
│   └── products/              # Products domain
│       ├── controllers/       # Product controllers
│       ├── services/          # Product services
│       ├── schemas/           # Product schemas
│       ├── stats/            # Product statistics (related feature)
│       │   ├── product-stats.controller.ts
│       │   ├── product-stats.service.ts
│       │   ├── product-stats.schema.ts
│       │   └── product-stats.module.ts
│       ├── products.module.ts
│       └── index.ts
│
├── common/                    # Shared utilities across modules
│   ├── decorators/           # Custom decorators (e.g., @Roles)
│   ├── enums/                # Shared enums (e.g., Role)
│   └── index.ts
│
├── app.module.ts             # Root module
├── app.controller.ts         # Root controller
├── app.service.ts            # Root service
└── main.ts                   # Application entry point
```

## Key Improvements

### 1. **Domain-Driven Organization**
- All feature modules are under `modules/` directory
- Related functionality is grouped together (e.g., product-stats is inside products)

### 2. **Separation of Concerns**
- Controllers in `controllers/` subdirectory
- Services in `services/` subdirectory
- Database schemas in `schemas/` subdirectory
- Each layer has a clear responsibility

### 3. **Shared Resources**
- Common decorators, enums, and utilities in `common/` directory
- Role enum is shared across auth and users modules
- Roles decorator is accessible to all modules

### 4. **Better Maintainability**
- Related files are close together
- Product-stats moved inside products module (tight coupling)
- User schema consolidated in users module (single source of truth)
- Index files for easier imports

### 5. **Clean Dependencies**
- Auth handles authentication logic
- Users handles user management (CRUD operations)
- Clear import paths reflecting the hierarchy

## Import Examples

```typescript
// Before
import { Role } from '../auth/enums/role.enum';
import { User } from '../auth/schemas/user.schema';

// After
import { Role } from '../../common/enums/role.enum';
import { User } from '../users/schemas/user.schema';

// Or using index exports
import { Role } from '../../common';
import { User } from '../users';
```

## Module Responsibilities

### Auth Module
- User authentication (login, register)
- JWT token generation and validation
- OAuth (Google) integration
- Guards and strategies

### Users Module
- User CRUD operations
- User profile management
- Role management
- User schema definition

### Products Module
- Product CRUD operations
- Product schema definition
- Product statistics (nested in stats/)

