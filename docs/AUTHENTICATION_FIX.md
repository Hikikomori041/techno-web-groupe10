# Authentication Fix - JWT Cookie Support

## Issue Fixed

**Problem**: Getting "Unauthorized" error when trying to add products from the dashboard.

**Root Cause**: JWT strategy was configured to read tokens from the `Authorization` header, but the application uses **httpOnly cookies** to store JWT tokens.

**Solution**: Updated JWT strategy to extract tokens from cookies (with fallback to Authorization header).

## What Was Changed

### File: `backend/src/modules/auth/strategies/jwt.strategy.ts`

**Before** (only read from Authorization header):
```typescript
jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
```

**After** (read from cookie first, then header as fallback):
```typescript
jwtFromRequest: ExtractJwt.fromExtractors([
  // Extract from cookie (primary method)
  (request: Request) => {
    return request?.cookies?.access_token;
  },
  // Fallback to Authorization header (for API testing)
  ExtractJwt.fromAuthHeaderAsBearerToken(),
]),
```

## How to Apply the Fix

### Step 1: Restart Backend

The backend needs to be restarted to load the updated JWT strategy.

**Option A - If backend is running in terminal:**
1. Press `Ctrl+C` to stop the backend
2. Run: `npm run start:dev`

**Option B - If backend is running in background:**
```bash
# Windows PowerShell
taskkill /F /IM node.exe
cd backend
npm run start:dev

# Linux/Mac
pkill node
cd backend
npm start:dev
```

### Step 2: Clear Browser Cookies (Optional but Recommended)

1. Open DevTools (F12)
2. Go to **Application** tab → **Cookies**
3. Delete `access_token` cookie
4. Re-login at http://localhost:3001/login

### Step 3: Test Product Creation

1. Login as admin: http://localhost:3001/login
   - Email: `admin@example.com`
   - Password: `admin123`

2. Go to Product Management: http://localhost:3001/dashboard/products

3. Click **"+ Add Product"**

4. Fill in the form:
   ```
   Name: Test Laptop
   Price: 999.99
   Category: 1
   Description: Test product
   Specifications: {}
   ```

5. Click **"Create Product"**

6. ✅ **Should work now!** Product will be created and appear in the table.

## Why This Fix Works

### Cookie-based Authentication Flow

```
Frontend Request
    ↓
Sends cookie: access_token=<JWT>
    ↓
Backend receives request
    ↓
JWT Strategy extracts token from cookie
    ↓
Validates token signature & expiration
    ↓
Decodes user info (id, email, roles)
    ↓
RolesGuard checks if user has admin/moderator role
    ↓
✅ Request authorized → Product created
```

### Before the Fix

```
Frontend Request with cookie
    ↓
Backend JWT Strategy only looked in Authorization header
    ↓
No token found (because it's in cookie, not header)
    ↓
❌ Unauthorized error
```

### After the Fix

```
Frontend Request with cookie
    ↓
Backend JWT Strategy checks cookie first
    ↓
Token found in cookie!
    ↓
Token validated
    ↓
✅ User authorized
```

## Benefits of This Approach

1. **Cookie Support** - Primary authentication method (secure)
2. **Header Fallback** - Still works with Authorization header (for Swagger/Postman)
3. **Backward Compatible** - Doesn't break existing functionality
4. **Secure** - httpOnly cookies prevent XSS attacks
5. **Flexible** - Supports both authentication methods

## Testing Both Methods

### Method 1: Cookie-based (Dashboard)
```
1. Login via frontend
2. Cookie is set automatically
3. All API calls include cookie
4. ✅ Works
```

### Method 2: Header-based (Swagger/Postman)
```
1. Get token from login response
2. Add header: Authorization: Bearer <token>
3. Make API call
4. ✅ Also works
```

## Troubleshooting

### Still Getting "Unauthorized"?

**Check 1: Backend Restarted?**
```bash
# Make sure you restarted the backend after the fix
cd backend
npm run start:dev
```

**Check 2: Cookie Present?**
1. Open DevTools (F12)
2. Go to **Application** → **Cookies** → http://localhost:3001
3. Look for `access_token` cookie
4. If missing → Re-login

**Check 3: Cookie Value**
```javascript
// In browser console:
document.cookie
// Should show: access_token=eyJhbGc...
```

**Check 4: CORS Configuration**
Ensure backend has:
```typescript
app.enableCors({
  origin: 'http://localhost:3001',
  credentials: true, // ✅ Must be true
});
```

**Check 5: Frontend Fetch**
Ensure all fetch calls include:
```typescript
fetch(url, {
  credentials: 'include', // ✅ Must be present
});
```

### "403 Forbidden" Error?

This means authentication works, but you don't have the right role.

**Solution:**
- Make sure you're logged in as admin (`admin@example.com`)
- Check user roles include `admin` or `moderator`

### Cookie Not Being Sent?

**Possible Causes:**
1. Domain mismatch (localhost vs 127.0.0.1)
2. `credentials: 'include'` missing in fetch
3. Backend CORS not set to `credentials: true`

**Solution:**
- Use consistent domain (always `localhost`)
- Check all fetch calls have `credentials: 'include'`

## Verification Checklist

After applying the fix, verify:

- [ ] Backend restarted successfully
- [ ] Can login at http://localhost:3001/login
- [ ] Cookie `access_token` is set in browser
- [ ] Can access dashboard at http://localhost:3001/dashboard
- [ ] Product management page loads: http://localhost:3001/dashboard/products
- [ ] Can click "+ Add Product" without errors
- [ ] Can submit form and create product
- [ ] Product appears in table immediately
- [ ] Can edit existing products
- [ ] Can delete products

## Additional Notes

### Security Benefits Maintained

✅ **httpOnly cookies** - JavaScript can't access token  
✅ **sameSite: strict** - CSRF protection  
✅ **secure: true** - HTTPS only (production)  
✅ **Role-based** - Admin/Moderator only  

### What This Doesn't Change

- ✅ Authentication flow remains the same
- ✅ Cookie security settings unchanged
- ✅ Role-based authorization still works
- ✅ Public endpoints still public
- ✅ Swagger API still functional

## Files Modified

1. `backend/src/modules/auth/strategies/jwt.strategy.ts` - JWT token extraction logic

## Related Documentation

- `SECURE_AUTH_COMPLETE_GUIDE.md` - Complete auth documentation
- `PRODUCT_MANAGEMENT_DASHBOARD_GUIDE.md` - Dashboard usage guide
- `PRODUCT_API_SECURITY_IMPLEMENTATION.md` - API security details

---

**Status**: ✅ Fixed  
**Impact**: High - Enables product management from dashboard  
**Backward Compatible**: Yes - Both cookie and header auth work  

