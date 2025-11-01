# Dashboard Statistics & Analytics Implementation Plan

## Overview
Transform the dashboard overview page into a comprehensive analytics dashboard with key statistics, revenue tracking, and visual graphs showing business performance.

## Features to Implement

### 1. Key Statistics Cards

**Metrics to Display:**
- 💰 **Total Revenue** - Sum of all completed orders
- 📦 **Total Orders** - Count of all orders
- 🛍️ **Products Sold** - Sum of quantities sold
- 📊 **Total Products** - Count of products in catalog
- 👥 **Total Users** - Count of registered users
- ⏳ **Pending Orders** - Orders awaiting processing

### 2. Revenue Analytics

**Calculations:**
- Total revenue (all orders)
- Revenue this month
- Revenue today
- Average order value
- Revenue by status (paid vs pending)

### 3. Graphs & Charts

**Charts to Add:**
- 📈 **Revenue Chart** - Line chart showing revenue over time (last 30 days)
- 📊 **Orders Chart** - Bar chart showing orders per day
- 🥧 **Order Status Pie Chart** - Distribution of order statuses
- 📉 **Top Products** - Bar chart of best-selling products

### 4. Recent Activity

- Latest 5 orders with status
- Low stock products alert
- Recent user registrations

---

## Backend Implementation

### Create Statistics Endpoint

**File:** `backend/src/modules/stats/stats.controller.ts`

**New Endpoint:** `GET /stats/dashboard`

**Response:**
```json
{
  "revenue": {
    "total": 25999.95,
    "thisMonth": 5999.98,
    "today": 1299.99,
    "averageOrder": 866.66
  },
  "orders": {
    "total": 30,
    "pending": 5,
    "completed": 20,
    "cancelled": 5
  },
  "products": {
    "total": 50,
    "inStock": 45,
    "outOfStock": 5,
    "lowStock": 8
  },
  "users": {
    "total": 150,
    "admins": 2,
    "moderators": 10
  },
  "sales": {
    "totalQuantitySold": 450,
    "topProducts": [
      { "name": "Laptop", "quantity": 125, "revenue": 162498.75 }
    ]
  },
  "recentOrders": [
    {
      "orderNumber": "ORD-...",
      "total": 1299.99,
      "status": "pending",
      "createdAt": "2025-10-21..."
    }
  ],
  "revenueByDay": [
    { "date": "2025-10-21", "revenue": 5999.98, "orders": 8 }
  ]
}
```

### Implementation Files

**Backend:**
1. `backend/src/modules/stats/stats.service.ts` - Calculate all statistics
2. `backend/src/modules/stats/stats.controller.ts` - Expose endpoint
3. `backend/src/modules/stats/stats.module.ts` - Module setup
4. `backend/src/modules/stats/stats.swagger.ts` - API docs

---

## Frontend Implementation

### Dashboard Overview Redesign

**File:** `frontend/src/app/dashboard/DashboardContent.tsx`

**New Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ Dashboard Overview                          [Logout]       │
├────────────────────────────────────────────────────────────┤
│ [💰 Revenue]  [📦 Orders]  [🛍️ Sold]  [👥 Users]         │
│   €25,999      30 total     450 items    150 users        │
├────────────────────────────────────────────────────────────┤
│ Revenue Chart (Last 30 Days)                              │
│ ┌──────────────────────────────────────────────────────┐  │
│ │         📈 Line Chart                                 │  │
│ └──────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│ Orders Overview           │  Top Products                  │
│ ┌──────────────────────┐  │  ┌──────────────────────────┐ │
│ │ 🥧 Pie Chart          │  │  │ 📊 Bar Chart             │ │
│ └──────────────────────┘  │  └──────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│ Recent Orders                                              │
│ • ORD-... - €1,299.99 - Pending                           │
│ • ORD-... - €999.99 - Shipped                             │
└────────────────────────────────────────────────────────────┘
```

### Chart Library

**Use:** `recharts` (React chart library)
- Lightweight
- Responsive
- TypeScript support
- Many chart types

**Installation:**
```bash
cd frontend
npm install recharts
```

### Components to Create

1. **StatCard** - Reusable stat display card
2. **RevenueChart** - Line chart component
3. **OrdersPieChart** - Pie chart for order statuses
4. **TopProductsChart** - Bar chart for best sellers
5. **RecentOrdersList** - Recent orders table

---

## Implementation Steps

### Backend

- [ ] Create stats module
- [ ] Implement stats.service.ts with calculations
- [ ] Create dashboard stats endpoint
- [ ] Calculate revenue from orders
- [ ] Calculate top products from order items
- [ ] Get recent orders
- [ ] Revenue by day aggregation
- [ ] Add Swagger documentation
- [ ] Register stats module

### Frontend

- [ ] Install recharts library
- [ ] Create stats API client
- [ ] Redesign dashboard overview page
- [ ] Add statistics cards grid
- [ ] Implement revenue line chart
- [ ] Implement orders pie chart
- [ ] Implement top products bar chart
- [ ] Add recent orders list
- [ ] Add low stock alerts
- [ ] Responsive grid layout
- [ ] Loading states
- [ ] Error handling

---

## Statistics Calculations

### Revenue Calculation

```typescript
Total Revenue = Sum of (order.total) WHERE order.status IN ['delivered', 'payment_confirmed', 'shipped']

This Month = Total WHERE createdAt >= start of month
Today = Total WHERE createdAt >= start of today
Average Order = Total Revenue / Total Orders
```

### Products Sold

```typescript
Total Sold = Sum of (product_stats.nombre_de_vente)
```

### Top Products

```typescript
Group order items by productId
Sum quantities and revenue per product
Sort by revenue DESC
Take top 5
```

### Revenue by Day

```typescript
Group orders by date (last 30 days)
Sum revenue per day
Return array of { date, revenue, orderCount }
```

---

## Chart Examples

### Revenue Chart (Line)
```
€6000 │           ╭─╮
      │          ╱   ╰╮
€4000 │    ╭────╯     ╰─╮
      │   ╱              ╰╮
€2000 │╭─╯                ╰─╮
      └────────────────────────
       Oct 1    Oct 15    Oct 30
```

### Order Status (Pie)
```
     Completed (60%)
    ╱────────╲
   │  Pending │ 
   │   (20%)  │
    ╲────────╱
     Cancelled (20%)
```

### Top Products (Bar)
```
Laptop    ████████████████ €162,498
iPhone    ████████████ €119,988
Monitor   ████████ €79,992
Keyboard  ██████ €59,994
Mouse     ████ €39,996
```

---

## Design Mockup

### Desktop Layout
```
┌──────────────────────────────────────────────────────────┐
│ Statistics Cards (4 columns)                             │
├──────────────────────────────────────────────────────────┤
│ Revenue Chart (Full width)                               │
├──────────────────────────────────────────────────────────┤
│ Orders Pie (50%)    │    Top Products Bar (50%)          │
├──────────────────────────────────────────────────────────┤
│ Recent Orders (Full width)                               │
└──────────────────────────────────────────────────────────┘
```

### Mobile Layout
```
┌──────────────────────┐
│ Stat Card 1          │
├──────────────────────┤
│ Stat Card 2          │
├──────────────────────┤
│ Revenue Chart        │
├──────────────────────┤
│ Orders Pie           │
├──────────────────────┤
│ Top Products         │
├──────────────────────┤
│ Recent Orders        │
└──────────────────────┘
```

---

## Technologies

### Charts
- **recharts**: React charting library
- Components: LineChart, PieChart, BarChart
- Responsive and customizable

### Data Aggregation
- MongoDB aggregation pipelines
- Date grouping for time series
- Sum/count calculations

---

Ready to implement when you approve! This will transform the dashboard into a comprehensive analytics platform.

