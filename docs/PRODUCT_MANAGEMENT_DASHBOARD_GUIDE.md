# Product Management Dashboard - User Guide

## 🎯 Overview

A complete admin/moderator interface for managing products directly from the dashboard. Includes full CRUD operations (Create, Read, Update, Delete) with a beautiful, responsive UI.

## 🔐 Access Requirements

**Required Roles**: ADMIN or MODERATOR

Regular users will see an "Access Denied" message if they try to access the product management page.

## 📍 How to Access

### From Dashboard
1. Login to your account at `http://localhost:3001/login`
2. Go to Dashboard at `http://localhost:3001/dashboard`
3. Look for the **"Management"** section
4. Click on **"Product Management"** card

### Direct Link
Visit: `http://localhost:3001/dashboard/products`

**Note**: You must be logged in as an admin or moderator.

## ✨ Features

### 1. View All Products
- **Table view** with all products
- Shows: Name, Price, Category, Creation Date
- **Empty state** message when no products exist
- **Responsive design** - works on mobile and desktop

### 2. Add New Product
Click the **"+ Add Product"** button to open the form.

**Fields**:
- **Product Name** (required) - e.g., "Laptop Dell XPS 15"
- **Price** (required) - in Euros (€), e.g., 1299.99
- **Category ID** (required) - numeric category, e.g., 1
- **Description** (optional) - product description
- **Specifications** (optional) - JSON format

**Example Specifications**:
```json
{
  "cpu": "Intel i7",
  "ram": "16GB",
  "storage": "512GB SSD"
}
```

### 3. Edit Product
1. Find the product in the table
2. Click **"Edit"** button
3. Form will populate with current data
4. Make your changes
5. Click **"Update Product"**

### 4. Delete Product
1. Find the product in the table
2. Click **"Delete"** button
3. Confirm deletion in the popup
4. Product will be removed immediately

## 🎨 User Interface

### Header Section
- Page title: "Product Management"
- Product count display
- **Back to Dashboard** button
- **Add Product** / **Cancel** button

### Product Form
- Clean, modern design
- Input validation
- Real-time feedback
- JSON editor for specifications
- **Create** or **Update** modes

### Product Table
- Sortable columns
- Hover effects
- Action buttons (Edit/Delete)
- Price formatted in EUR currency
- Date formatted in French locale

## 💡 Usage Examples

### Example 1: Add a Laptop
```
Name: Laptop Dell XPS 15
Price: 1299.99
Category: 1
Description: Ordinateur portable haute performance avec écran 4K
Specifications:
{
  "cpu": "Intel i7-12700H",
  "ram": "16GB DDR5",
  "storage": "512GB SSD",
  "screen": "15.6 inch 4K OLED"
}
```

### Example 2: Add a Smartphone
```
Name: iPhone 14 Pro
Price: 999.99
Category: 2
Description: Smartphone Apple dernière génération
Specifications:
{
  "screen": "6.1 inches",
  "camera": "48MP",
  "storage": "256GB",
  "chip": "A16 Bionic"
}
```

### Example 3: Add Headphones
```
Name: Sony WH-1000XM5
Price: 349.99
Category: 3
Description: Casque sans fil à réduction de bruit
Specifications:
{
  "battery": "30 hours",
  "bluetooth": "5.2",
  "noise_cancelling": "yes",
  "weight": "250g"
}
```

## 🔒 Security Features

### Authentication
- **JWT-based** authentication via httpOnly cookies
- Automatic session validation
- Redirects to login if not authenticated

### Authorization
- **Role check** on page load
- Only admins and moderators can access
- Regular users see "Access Denied" message

### API Security
All API calls include:
- `credentials: 'include'` - sends authentication cookies
- Proper error handling
- User feedback on success/failure

## 🎯 Navigation

### From Product Management:
- **← Dashboard** - Return to main dashboard
- **+ Add Product** - Open add form
- **Cancel** - Close form (when open)

### From Main Dashboard:
- **Product Management** card - Manage products (admin/moderator only)
- **View Products** card - Browse public products page

## 📱 Responsive Design

### Desktop (≥ 768px)
- Full table with all columns
- Side-by-side form fields
- Spacious layout

### Mobile (< 768px)
- Scrollable table
- Stacked form fields
- Touch-friendly buttons

## ⚠️ Error Handling

### Common Errors & Solutions

**"Access Denied"**
- **Cause**: User doesn't have admin/moderator role
- **Solution**: Login with admin account (admin@example.com / admin123)

**"Failed to save product"**
- **Cause**: Invalid data or authentication expired
- **Solution**: Check all required fields, refresh and login again

**"Invalid JSON"**
- **Cause**: Specifications field has malformed JSON
- **Solution**: Validate JSON format (use a JSON validator online)

**"Failed to fetch products"**
- **Cause**: Backend not running or CORS issue
- **Solution**: Ensure backend is running on http://localhost:3000

## 🔄 Workflow

### Typical Admin Workflow:
1. **Login** as admin/moderator
2. **Navigate** to Dashboard
3. Click **"Product Management"**
4. **Add products** using the form
5. **Edit** products to update info
6. **Delete** obsolete products
7. **View** results on public products page

## 🎨 Visual Indicators

- **Blue badge** - Category ID
- **Green price** - Product price in EUR
- **Blue button** - Primary actions (Add, Update)
- **Gray button** - Secondary actions (Cancel)
- **Red button** - Destructive actions (Delete)
- **Blue links** - Edit action
- **Red links** - Delete action

## 🚀 Quick Start

1. **Start Backend**:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Login as Admin**:
   - Visit: http://localhost:3001/login
   - Email: admin@example.com
   - Password: admin123

4. **Access Product Management**:
   - Go to Dashboard
   - Click "Product Management"
   - Start adding products!

5. **View Public Page**:
   - Visit: http://localhost:3001/products
   - See all products displayed

## 📊 Data Flow

```
User Interface (Dashboard)
    ↓
JWT Auth Check (Cookie-based)
    ↓
Role Verification (Admin/Moderator)
    ↓
API Calls (with credentials)
    ↓
Backend (NestJS + JWT + Role Guards)
    ↓
MongoDB (Products Collection)
```

## 🎯 API Endpoints Used

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | Public | List all products |
| POST | `/products/create` | Admin/Mod | Create product |
| PUT | `/products/:id` | Admin/Mod | Update product |
| DELETE | `/products/:id` | Admin/Mod | Delete product |

## 💡 Tips & Best Practices

1. **Use valid JSON** for specifications field
2. **Test on multiple devices** for responsiveness
3. **Keep descriptions concise** for better UX
4. **Use consistent category IDs** for organization
5. **Regular backups** of MongoDB data
6. **Monitor product count** to track inventory

## 🎉 What's Next?

After setting up product management, you can:

1. **Add Categories Management** - Create CRUD for categories
2. **Add Image Upload** - Allow product image uploads
3. **Add Bulk Operations** - Import/export products
4. **Add Search & Filters** - Filter by category, price range
5. **Add Product Stats** - View and manage stock/sales
6. **Add Pagination** - For large product lists
7. **Add Sorting** - Sort by price, name, date

## 🔗 Related Pages

- **Public Products Page**: http://localhost:3001/products
- **Swagger API Docs**: http://localhost:3000/api
- **Main Dashboard**: http://localhost:3001/dashboard
- **Login Page**: http://localhost:3001/login

---

**Created**: Product Management Dashboard
**Access**: Admin/Moderator Only
**Security**: JWT + Role-based Authorization
**Status**: ✅ Production Ready

