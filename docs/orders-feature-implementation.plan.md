# Order Management System Implementation Plan

## Overview
Implement a complete order (commande) management system where users can place orders from their cart, and admins/moderators can manage order statuses through the entire lifecycle (preparation → payment → delivery).

## Architecture

### Database Schema

**Order Schema** (`orders.schema.ts`)
```typescript
{
  userId: ObjectId (ref: User, required)
  items: [
    {
      productId: ObjectId (ref: Product, required)
      productName: string (snapshot)
      productPrice: number (snapshot)
      quantity: number
      subtotal: number
    }
  ]
  total: number
  status: enum ['pending', 'preparation', 'payment_confirmed', 'shipped', 'delivered', 'cancelled']
  paymentStatus: enum ['pending', 'paid', 'failed', 'refunded']
  shippingAddress: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Order Status Flow
```
pending → preparation → payment_confirmed → shipped → delivered
                ↓
           cancelled (any time)
```

### Payment Status Flow
```
pending → paid → (refunded if needed)
    ↓
  failed
```

## Backend Implementation

### 1. Create Orders Module

**File Structure:**
```
backend/src/modules/orders/
├── schemas/
│   └── order.schema.ts
├── dto/
│   ├── create-order.dto.ts
│   ├── update-order-status.dto.ts
│   └── update-payment-status.dto.ts
├── orders.service.ts
├── orders.controller.ts
├── orders.swagger.ts
└── orders.module.ts
```

### 2. API Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/orders` | Create order from cart | ✅ | User |
| GET | `/orders` | Get user's orders | ✅ | User |
| GET | `/orders/:id` | Get specific order | ✅ | User/Admin/Mod |
| GET | `/orders/all` | Get all orders (admin) | ✅ | Admin/Mod |
| PUT | `/orders/:id/status` | Update order status | ✅ | Admin/Mod |
| PUT | `/orders/:id/payment` | Update payment status | ✅ | Admin/Mod |
| DELETE | `/orders/:id` | Cancel order | ✅ | User/Admin |

### 3. Create Order Logic

**When user clicks "Validate Cart":**
1. Fetch user's cart
2. Validate cart has items
3. Create order with:
   - User ID from JWT
   - Cart items (snapshot product info)
   - Total price
   - Initial status: 'pending'
   - Payment status: 'pending'
4. Clear user's cart
5. Return created order

### 4. Status Management

**Update Order Status:**
- Admins/Moderators can update status
- Validation: Can't go from 'delivered' to 'pending'
- Status history tracking (optional)

**Update Payment Status:**
- Admins/Moderators can update payment
- Required before shipping

## Frontend Implementation

### 1. Update Cart Page

**File:** `frontend/src/app/cart/page.tsx`

**Changes:**
- Replace alert in `handleValidateCart()`
- Show shipping address form
- Create order via API
- Clear cart after order creation
- Redirect to order confirmation page

### 2. Create Order Pages

**Orders List Page:** `frontend/src/app/orders/page.tsx`
- List user's orders
- Show status badges
- Click to view details

**Order Detail Page:** `frontend/src/app/orders/[id]/page.tsx`
- Show order items
- Show delivery address
- Show order status
- Show payment status
- Track order progress

### 3. Admin Order Management

**Admin Orders Page:** `frontend/src/app/dashboard/orders/page.tsx`
- Table of all orders
- Filter by status
- Update status dropdowns
- Update payment status
- Search/filter functionality

### 4. Order Confirmation Page

**File:** `frontend/src/app/orders/confirmation/page.tsx`
- Success message
- Order number
- Order summary
- Next steps
- Link to track order

## Implementation Details

### Order Creation Flow
```
User Cart → [Validate] → Create Order → Clear Cart → Confirmation Page
                             ↓
                    Save to MongoDB
                             ↓
                    Email notification (future)
```

### Status Management Flow
```
Admin Dashboard → Orders Table → [Update Status Dropdown]
                                         ↓
                                  PUT /orders/:id/status
                                         ↓
                                  Order status updated
                                         ↓
                                  Email to customer (future)
```

## Data Snapshots

**Why snapshot product data:**
- Product price may change after order
- Product may be deleted
- Order should preserve exact purchase details
- Historical accuracy

**Snapshot fields:**
- Product name
- Product price (at time of purchase)
- Quantity
- Subtotal

## Security

### Authorization
- Users can only see their own orders
- Admins/Moderators can see all orders
- Only Admins/Moderators can update statuses
- Users can cancel their own pending orders

### Validation
- Verify cart not empty before creating order
- Validate status transitions
- Ensure payment confirmed before shipping
- Check stock availability (optional)

## Files to Create/Modify

### Backend (New Files)
1. `backend/src/modules/orders/schemas/order.schema.ts`
2. `backend/src/modules/orders/dto/create-order.dto.ts`
3. `backend/src/modules/orders/dto/update-order-status.dto.ts`
4. `backend/src/modules/orders/dto/update-payment-status.dto.ts`
5. `backend/src/modules/orders/orders.service.ts`
6. `backend/src/modules/orders/orders.controller.ts`
7. `backend/src/modules/orders/orders.swagger.ts`
8. `backend/src/modules/orders/orders.module.ts`

### Backend (Modified Files)
9. `backend/src/app.module.ts` - Register OrdersModule
10. `backend/src/main.ts` - Add 'orders' tag to Swagger

### Frontend (New Files)
11. `frontend/src/lib/ordersApi.ts` - API client
12. `frontend/src/app/orders/page.tsx` - User's orders list
13. `frontend/src/app/orders/[id]/page.tsx` - Order detail
14. `frontend/src/app/orders/confirmation/page.tsx` - Order confirmation
15. `frontend/src/app/dashboard/orders/page.tsx` - Admin order management

### Frontend (Modified Files)
16. `frontend/src/app/cart/page.tsx` - Implement real validate cart

## Implementation Todos

- [ ] Create Order schema with statuses
- [ ] Create Order DTOs with validation
- [ ] Implement OrdersService (CRUD + status management)
- [ ] Create OrdersController with 7 endpoints
- [ ] Add Swagger documentation
- [ ] Create OrdersModule and register
- [ ] Create orders API client (frontend)
- [ ] Update cart page to create orders
- [ ] Create user orders list page
- [ ] Create order detail page
- [ ] Create order confirmation page
- [ ] Create admin order management dashboard
- [ ] Test order creation flow
- [ ] Test status updates
- [ ] Test authorization

## Status Badges Design

```typescript
const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  preparation: 'bg-blue-100 text-blue-800',
  payment_confirmed: 'bg-green-100 text-green-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};
```

This is a comprehensive feature. Ready to implement when you approve!

