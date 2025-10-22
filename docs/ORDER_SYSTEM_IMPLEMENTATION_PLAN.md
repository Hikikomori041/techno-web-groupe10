# Order Management System - Complete Implementation Plan ✅

## Overview
Implement a full-featured order (commande) management system with address collection, automatic stock deduction, and complete status workflow management.

## Implementation Decisions

1. ✅ **Shipping Address**: Ask during order creation via modal form
2. ✅ **Stock Deduction**: Automatic when order is created
3. ✅ **Order Cancellation**: Users can cancel any status before 'shipped'

---

## Backend Implementation

### Order Schema
```typescript
{
  userId: ObjectId (ref: User, required, indexed)
  orderNumber: string (unique, auto-generated: ORD-20251021-XXXXX)
  items: [
    {
      productId: ObjectId (ref: Product)
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
    street: string (required)
    city: string (required)
    postalCode: string (required)
    country: string (required)
  }
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### API Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/orders` | Create order from cart | ✅ | Any user |
| GET | `/orders` | Get user's orders | ✅ | Any user |
| GET | `/orders/:id` | Get order details | ✅ | User/Admin/Mod |
| GET | `/orders/all` | Get all orders | ✅ | Admin/Mod |
| PUT | `/orders/:id/status` | Update order status | ✅ | Admin/Mod |
| PUT | `/orders/:id/payment` | Update payment status | ✅ | Admin/Mod |
| DELETE | `/orders/:id` | Cancel order | ✅ | User/Admin |

### Order Creation Logic

**POST /orders** - Body: `{ shippingAddress }`
1. Get user's cart
2. Validate cart not empty
3. **Validate stock availability** for all items
4. Generate unique order number
5. Create order with:
   - Items snapshot (product name, price locked)
   - User ID from JWT
   - Shipping address
   - Status: 'pending'
   - Payment: 'pending'
6. **Reduce stock** for each product
7. **Clear user's cart**
8. Return created order

### Stock Management

**On Order Creation:**
```typescript
for (const item of cartItems) {
  const product = await Product.findById(item.productId);
  
  // Validate stock
  if (product.quantite_en_stock < item.quantity) {
    throw new BadRequestException(
      `Stock insuffisant pour ${product.nom}. Disponible: ${product.quantite_en_stock}`
    );
  }
  
  // Reduce stock
  product.quantite_en_stock -= item.quantity;
  await product.save();
}
```

**On Order Cancellation:**
```typescript
// Only if status is before 'shipped'
if (['pending', 'preparation', 'payment_confirmed'].includes(order.status)) {
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (product) {
      product.quantite_en_stock += item.quantity;
      await product.save();
    }
  }
  order.status = 'cancelled';
  await order.save();
}
```

---

## Frontend Implementation

### 1. Cart Page - Address Modal

**File:** `frontend/src/app/cart/page.tsx`

**New Component: AddressModal**
```tsx
<AddressModal
  isOpen={showAddressModal}
  onClose={() => setShowAddressModal(false)}
  onSubmit={handleCreateOrder}
  total={cart.total}
/>
```

**Modal Fields:**
- Street Address (required)
- City (required)
- Postal Code (required)
- Country (required, dropdown or input)

**Flow:**
1. User clicks "Valider le panier"
2. Address modal opens
3. User fills shipping information
4. Click "Confirmer la commande"
5. API call to create order
6. Cart cleared
7. Redirect to `/orders/confirmation?orderId=XXX`

### 2. Order Confirmation Page

**File:** `frontend/src/app/orders/confirmation/page.tsx`

**Display:**
- ✅ Success icon
- Order number (ORD-20251021-12345)
- Order summary (items, total)
- Shipping address
- Expected delivery info
- Buttons: "View Order" | "Continue Shopping"

### 3. User Orders List

**File:** `frontend/src/app/orders/page.tsx`

**Features:**
- List of all user's orders
- Order cards showing:
  - Order number
  - Date
  - Total
  - Status badge
  - Items count
- Click to view details
- Filter by status

### 4. Order Detail Page

**File:** `frontend/src/app/orders/[id]/page.tsx`

**Display:**
- Order header (number, date, status)
- Status progress bar
- Items list with images
- Shipping address
- Payment status
- Total breakdown
- Cancel button (if allowed)
- Track order timeline

### 5. Admin Orders Dashboard

**File:** `frontend/src/app/dashboard/orders/page.tsx`

**Features:**
- Table of all orders
- Columns: Order #, Customer, Date, Total, Status, Payment, Actions
- Status dropdown to update
- Payment dropdown to update
- Filter by status/payment
- Search by order number or customer
- View order details

**Status Management:**
```tsx
<select onChange={(e) => updateOrderStatus(orderId, e.target.value)}>
  <option value="pending">⏳ Pending</option>
  <option value="preparation">📦 Preparation</option>
  <option value="payment_confirmed">💳 Payment Confirmed</option>
  <option value="shipped">🚚 Shipped</option>
  <option value="delivered">✅ Delivered</option>
  <option value="cancelled">❌ Cancelled</option>
</select>
```

---

## Implementation Checklist

### Backend (8 new files)
- [ ] Create order.schema.ts with all fields
- [ ] Create create-order.dto.ts (shippingAddress)
- [ ] Create update-order-status.dto.ts
- [ ] Create update-payment-status.dto.ts
- [ ] Implement orders.service.ts (create, get, update status, cancel, stock management)
- [ ] Create orders.controller.ts (7 endpoints)
- [ ] Add orders.swagger.ts documentation
- [ ] Create orders.module.ts and register in app.module.ts

### Frontend (5 new files + 1 modified)
- [ ] Create ordersApi.ts client
- [ ] Update cart/page.tsx with address modal
- [ ] Create orders/confirmation/page.tsx
- [ ] Create orders/page.tsx (user orders list)
- [ ] Create orders/[id]/page.tsx (order details)
- [ ] Create dashboard/orders/page.tsx (admin management)

### Features to Implement
- [ ] Address collection modal in cart
- [ ] Stock validation before order creation
- [ ] Automatic stock deduction
- [ ] Order number generation
- [ ] Product price snapshots
- [ ] Cart clearing after order
- [ ] Status update workflow
- [ ] Payment status management
- [ ] Order cancellation with stock restoration
- [ ] Status badges and colors
- [ ] Order timeline/tracking
- [ ] Admin order filters

---

## Ready to Implement?

Type **"implement it"** or **"proceed"** to start the implementation with these specifications.

