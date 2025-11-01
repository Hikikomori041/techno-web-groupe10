# Guide: Add Test Products to Database

## Option 1: Using Swagger UI (Recommended - Easiest)

### Step 1: Open Swagger UI
Visit: http://localhost:3000/api

### Step 2: Authenticate as Admin
1. Click the **"Authorize"** button (🔓 lock icon at the top right)
2. In the "Available authorizations" dialog, you'll see the login is cookie-based
3. Close the authorization dialog
4. Go to the **auth** section and use **POST /auth/login**
5. Click "Try it out"
6. Use these credentials:
   ```json
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```
7. Click "Execute"
8. The JWT token will be automatically stored in your browser cookies

### Step 3: Add Products
1. Go to the **products** section
2. Find **POST /products/create** (you'll see a lock icon 🔒)
3. Click "Try it out"
4. Paste one of the product examples below
5. Click "Execute"
6. Repeat for each product you want to add

### Test Product Examples:

**Product 1 - Laptop:**
```json
{
  "nom": "Laptop Dell XPS 15",
  "prix": 1299.99,
  "description": "Ordinateur portable haute performance avec écran 4K",
  "id_categorie": 1,
  "specifications": {
    "cpu": "Intel i7",
    "ram": "16GB",
    "storage": "512GB SSD"
  }
}
```

**Product 2 - Smartphone:**
```json
{
  "nom": "iPhone 14 Pro",
  "prix": 999.99,
  "description": "Smartphone Apple dernière génération",
  "id_categorie": 2,
  "specifications": {
    "screen": "6.1 inches",
    "camera": "48MP",
    "storage": "256GB"
  }
}
```

**Product 3 - Headphones:**
```json
{
  "nom": "Sony WH-1000XM5",
  "prix": 349.99,
  "description": "Casque sans fil à réduction de bruit",
  "id_categorie": 3,
  "specifications": {
    "battery": "30 hours",
    "bluetooth": "5.2",
    "noise_cancelling": "yes"
  }
}
```

**Product 4 - Monitor:**
```json
{
  "nom": "Samsung 4K Monitor 32\"",
  "prix": 599.99,
  "description": "Moniteur 32 pouces Ultra HD",
  "id_categorie": 4,
  "specifications": {
    "size": "32 inches",
    "resolution": "3840x2160",
    "refresh_rate": "60Hz"
  }
}
```

**Product 5 - Mouse:**
```json
{
  "nom": "Logitech MX Master 3",
  "prix": 99.99,
  "description": "Souris ergonomique sans fil",
  "id_categorie": 5,
  "specifications": {
    "battery": "70 days",
    "dpi": "4000",
    "buttons": "7"
  }
}
```

**Product 6 - Keyboard:**
```json
{
  "nom": "Keychron K8 Pro",
  "prix": 149.99,
  "description": "Clavier mécanique sans fil rétroéclairé",
  "id_categorie": 5,
  "specifications": {
    "switches": "Gateron Brown",
    "layout": "TKL",
    "wireless": "yes"
  }
}
```

---

## Option 2: Using PowerShell (Windows)

### Step 1: Login as Admin
```powershell
# Login and save session
$loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"admin@example.com","password":"admin123"}' `
  -SessionVariable session

# Check if login succeeded
$loginResponse.Content | ConvertFrom-Json
```

### Step 2: Add a Product
```powershell
# Add one product
$productData = @{
  nom = "Laptop Dell XPS 15"
  prix = 1299.99
  description = "Ordinateur portable haute performance"
  id_categorie = 1
  specifications = @{
    cpu = "Intel i7"
    ram = "16GB"
    storage = "512GB SSD"
  }
} | ConvertTo-Json -Depth 5

$response = Invoke-WebRequest -Uri "http://localhost:3000/products/create" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $productData `
  -WebSession $session

$response.Content | ConvertFrom-Json
```

---

## Option 3: Using curl (Linux/Mac/Git Bash)

### Step 1: Login as Admin
```bash
# Login and save cookies
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  --cookie-jar cookies.txt

# Response will contain user data
```

### Step 2: Add a Product
```bash
# Add one product
curl -X POST http://localhost:3000/products/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "nom": "Laptop Dell XPS 15",
    "prix": 1299.99,
    "description": "Ordinateur portable haute performance",
    "id_categorie": 1,
    "specifications": {
      "cpu": "Intel i7",
      "ram": "16GB",
      "storage": "512GB SSD"
    }
  }'
```

---

## Verify Products Were Added

### Method 1: Visit the Frontend
Visit: http://localhost:3001/products

You should see all the products you added displayed in a beautiful grid layout.

### Method 2: Check via API
```bash
# View all products (no auth needed - public endpoint)
curl http://localhost:3000/products
```

Or visit in browser: http://localhost:3000/products

### Method 3: Check in Swagger
Visit http://localhost:3000/api and use **GET /products**

---

## Troubleshooting

### "401 Unauthorized" when creating products
- Make sure you're logged in as admin
- The JWT cookie may have expired (7 days expiry)
- Solution: Login again

### "403 Forbidden" when creating products
- You're logged in but don't have admin/moderator role
- Solution: Use the admin account (admin@example.com / admin123)

### Products not showing in frontend
1. Check browser console for errors
2. Verify backend is running (http://localhost:3000)
3. Verify frontend is running (http://localhost:3001)
4. Check that products exist: `curl http://localhost:3000/products`

### CORS errors
- Frontend must use `credentials: 'include'` in fetch requests
- Backend must have `credentials: true` in CORS config
- Both are already configured in your project ✅

---

## What's Next?

After adding products:

1. **View Products**: Visit http://localhost:3001/products
2. **View Product Stats**: Visit http://localhost:3000/api and test `GET /product-stats`
3. **Update Stock**: Use `POST /product-stats/:id/restock` (requires admin)
4. **Record Sales**: Use `POST /product-stats/:id/sell` (requires admin)
5. **Edit Products**: Use `PUT /products/:id` (requires admin)
6. **Delete Products**: Use `DELETE /products/:id` (requires admin)

## Security Note

🔒 Remember:
- **Public (anyone)**: View products (GET)
- **Protected (admin/moderator only)**: Create, Update, Delete products
- All write operations to product-stats also require admin/moderator role

