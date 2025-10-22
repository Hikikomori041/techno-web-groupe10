# Seed IT Material Categories

## Option 1: Via Swagger UI

1. Start your backend server
2. Go to http://localhost:3000/api
3. Login first (use `/auth/login` endpoint to get authenticated)
4. Use the `POST /categories` endpoint (in the categories section)
5. Add each category below one by one

## Option 2: Via API Client (e.g., Postman or Thunder Client)

### Request Format:
```
POST http://localhost:3000/categories
Content-Type: application/json
Cookie: access_token=YOUR_JWT_TOKEN

{
  "name": "Laptops",
  "description": "Portable computers and notebooks",
  "isActive": true
}
```

## Categories to Create:

### 1. Laptops
```json
{
  "name": "Laptops",
  "description": "Portable computers and notebooks for work and gaming",
  "isActive": true
}
```

### 2. Desktops
```json
{
  "name": "Desktops",
  "description": "Desktop computers and workstations",
  "isActive": true
}
```

### 3. Monitors
```json
{
  "name": "Monitors",
  "description": "Computer displays and screens for all purposes",
  "isActive": true
}
```

### 4. Peripherals
```json
{
  "name": "Peripherals",
  "description": "Keyboards, mice, webcams, headsets, and input devices",
  "isActive": true
}
```

### 5. Components
```json
{
  "name": "Components",
  "description": "RAM, CPU, GPU, motherboards, and storage drives",
  "isActive": true
}
```

### 6. Networking
```json
{
  "name": "Networking",
  "description": "Routers, switches, cables, and network equipment",
  "isActive": true
}
```

### 7. Software & Licenses
```json
{
  "name": "Software & Licenses",
  "description": "Operating systems, productivity software, and licenses",
  "isActive": true
}
```

### 8. Accessories
```json
{
  "name": "Accessories",
  "description": "Cases, bags, adapters, cleaning kits, and other accessories",
  "isActive": true
}
```

## Option 3: Via Frontend Dashboard

1. Login as admin
2. Go to http://localhost:3001/dashboard/categories
3. Click "+ Add Category"
4. Add each category manually using the form

## Verify Categories

After adding categories, verify by visiting:
- GET http://localhost:3000/categories (returns all categories)
- Or check in the frontend at /dashboard/categories

## Sample Product with New Schema

Once categories are created, here's an example product:

```json
{
  "nom": "Dell XPS 15 Laptop",
  "prix": 1899.99,
  "description": "High-performance laptop with stunning display and powerful specs",
  "categoryId": "YOUR_LAPTOPS_CATEGORY_ID",
  "specifications": [
    { "key": "Processor", "value": "Intel Core i7-12700H" },
    { "key": "RAM", "value": "16GB DDR5" },
    { "key": "Storage", "value": "512GB NVMe SSD" },
    { "key": "Display", "value": "15.6\" FHD+ (1920x1200)" },
    { "key": "Graphics", "value": "NVIDIA GeForce RTX 3050 Ti" },
    { "key": "Weight", "value": "1.86 kg" },
    { "key": "Battery", "value": "86Wh" },
    { "key": "OS", "value": "Windows 11 Pro" }
  ],
  "quantite_en_stock": 15
}
```

## Migration Note

If you have existing products with old schema (`id_categorie` as number), you'll need to:
1. Create all categories first
2. Note the category IDs
3. Update each product manually or via script to:
   - Replace `id_categorie: 1` with `categoryId: "actual_mongodb_id"`
   - Convert specifications from JSON object to array format

