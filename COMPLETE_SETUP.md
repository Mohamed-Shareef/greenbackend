# SmartPOS Complete Architecture & Database Setup

## System Overview

```
Frontend (React)
      ↓
  React Query Hooks
      ↓
  Typed API Layer
      ↓
  HTTP (REST)
      ↓
Express.js Backend
      ↓
TypeORM + Migrations
      ↓
PostgreSQL Database (11 tables)
```

---

## 🗂️ What's Created

### Frontend (greenwave-ui-builder/)

✅ **6 Complete CRUD Pages:**
- Sales Entry (Create, Read, Update, Delete invoices)
- Purchase Order (Create, Read, Update, Delete orders)
- Purchase Entry (Create, Read, Update, Delete purchase bills)
- Purchase Return (Create, Read, Update, Delete with reason tracking)
- Sale Return (Create, Read, Update, Delete with reason tracking)
- Stock Valuation (Inventory management with category tracking)

✅ **Type-Safe API Layer:**
- File: `src/services/api.ts` (180+ lines)
- Typed endpoints with generic TypeScript
- Automatic response handling
- Error management

✅ **React Query Hooks:**
- File: `src/hooks/useApi.ts` (350+ lines)
- 42 custom hooks (7 per module)
- Automatic cache invalidation
- Toast notifications
- Real-time UI updates

### Backend (backend/)

✅ **Express.js Server:**
- File: `src/index.ts`
- CORS configured for frontend
- Health check endpoint
- Full error handling

✅ **TypeORM Setup:**
- File: `src/data-source.ts`
- PostgreSQL connection
- Automatic entity discovery
- Migration support

✅ **11 Database Tables:**
- Sales & SaleItems
- PurchaseOrders & OrderItems
- Purchases & PurchaseItems
- PurchaseReturns & PurchaseReturnItems
- SaleReturns & SaleReturnItems
- Stock

✅ **6 Complete API Route Files:**
- `src/routes/sales.ts` (Full CRUD)
- `src/routes/purchaseOrders.ts` (Full CRUD)
- `src/routes/purchases.ts` (Full CRUD)
- `src/routes/purchaseReturns.ts` (Full CRUD)
- `src/routes/saleReturns.ts` (Full CRUD)
- `src/routes/stock.ts` (Full CRUD)

✅ **TypeORM Migration:**
- File: `src/migrations/1000000000000-InitialSchema.ts`
- Creates all 11 tables with relationships
- Adds database indexes for performance
- Can be reverted if needed

---

## 🚀 Complete Setup Flow (15 minutes)

### 1. PostgreSQL Installation & Database Creation (3 min)

```bash
# Install PostgreSQL
# Windows: choco install postgresql
# macOS: brew install postgresql@15
# Linux: sudo apt-get install postgresql

# Create database using pgAdmin or command line:
CREATE DATABASE smartpos_db;
```

### 2. Backend Setup (5 min)

```bash
cd backend

# Install dependencies
npm install

# Run migrations to create tables
npm run migration:run

# Start backend server
npm run dev
```

Expected: `✓ Server running on http://localhost:5000`

### 3. Frontend Configuration (1 min)

Update frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Frontend already has all hooks and pages ready! ✅

### 4. Start Frontend (2 min)

```bash
# In greenwave-ui-builder folder
npm run dev
```

Expected: Opens `http://localhost:5173`

### 5. Test Complete Flow (4 min)

**Sales Entry Test:**
1. Go to Sales Entry page
2. Fill: Invoice No, Customer Name, Date
3. Add items (Product, Qty, Price)
4. Click Save → Toast: "Created successfully"
5. List appears with Edit/Delete buttons
6. Edit entry → Check updates in list
7. Delete → Confirm deletion
8. **Refresh page** → Data still there! ✅

Data is now in PostgreSQL!

---

## 📊 Data Flow Diagram

```
User Action (Click Save)
        ↓
React Component (SalesEntry.tsx)
        ↓
Custom Hook (useCreateSales)
        ↓
React Query Mutation
        ↓
API Service (salesApi.create)
        ↓
HTTP POST to Backend
        ↓
Express Route Handler (/api/sales)
        ↓
TypeORM Repository
        ↓
PostgreSQL Database
        ↓
Response sent back to Frontend
        ↓
Toast Notification + Cache Invalidation
        ↓
React Query re-fetch from database
        ↓
UI updates with fresh data + persistence ✅
```

---

## 🔑 Key Features

### ✅ Data Persistence
- All data saved to PostgreSQL
- Survives page refresh
- No data loss

### ✅ Real-Time CRUD
- Create: Form dialog, save to DB
- Read: Fetch from DB on page load
- Update: Edit button, modify in DB
- Delete: Confirm, remove from DB

### ✅ Type Safety
- TypeScript from frontend to backend
- Compilation errors caught early
- Autocomplete in IDE

### ✅ Error Handling
- Try-catch blocks on backend
- Toast notifications for users
- HTTP status codes (201, 404, 500)

### ✅ Performance
- Database indexes on frequently queried fields
- Cascade delete for related items
- CORS configured for frontend

### ✅ Scalability
- Migrations system for future schema changes
- Proper foreign key relationships
- Repository pattern with TypeORM

---

## 🔍 Database Schema Details

### Sales Table
```sql
TABLE sales (
  id UUID PRIMARY KEY,
  invoiceNo VARCHAR UNIQUE,
  customerName VARCHAR,
  date DATE,
  total DECIMAL(10,2),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)

TABLE sale_items (
  id UUID PRIMARY KEY,
  productName VARCHAR,
  quantity INT,
  unitPrice DECIMAL(10,2),
  amount DECIMAL(10,2),
  saleId UUID (FK) → sales.id
)
```

Similar structure for:
- PurchaseOrders + OrderItems
- Purchases + PurchaseItems
- PurchaseReturns + PurchaseReturnItems
- SaleReturns + SaleReturnItems
- Stock (standalone)

---

## 📡 API Response Format

All endpoints return consistent JSON:

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "invoiceNo": "INV-001",
    "customerName": "John Doe",
    "date": "2024-04-09",
    "total": 2500,
    "items": [
      {
        "id": "uuid-here",
        "productName": "Product A",
        "quantity": 2,
        "unitPrice": 1000,
        "amount": 2000
      }
    ],
    "createdAt": "2024-04-09T10:00:00Z",
    "updatedAt": "2024-04-09T10:00:00Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Sale not found"
}
```

---

## 🔐 Project Structure

```
smartPOS/
├── greenwave-ui-builder/          # Frontend
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts             # Typed API layer
│   │   ├── hooks/
│   │   │   └── useApi.ts          # React Query hooks
│   │   ├── pages/
│   │   │   ├── SalesEntry.tsx
│   │   │   ├── PurchaseOrder.tsx
│   │   │   ├── PurchaseEntry.tsx
│   │   │   ├── PurchaseReturn.tsx
│   │   │   ├── SaleReturn.tsx
│   │   │   └── StockValuation.tsx
│   │   └── components/ui/         # ShadCN UI components
│   └── .env                       # VITE_API_URL=http://localhost:5000/api
│
└── backend/                       # Backend
    ├── src/
    │   ├── entities/             # TypeORM entity definitions
    │   │   ├── Sale.ts
    │   │   ├── SaleItem.ts
    │   │   ├── PurchaseOrder.ts
    │   │   ├── OrderItem.ts
    │   │   ├── Purchase.ts
    │   │   ├── PurchaseItem.ts
    │   │   ├── PurchaseReturn.ts
    │   │   ├── PurchaseReturnItem.ts
    │   │   ├── SaleReturn.ts
    │   │   ├── SaleReturnItem.ts
    │   │   └── Stock.ts
    │   ├── routes/               # API route handlers
    │   │   ├── sales.ts
    │   │   ├── purchaseOrders.ts
    │   │   ├── purchases.ts
    │   │   ├── purchaseReturns.ts
    │   │   ├── saleReturns.ts
    │   │   └── stock.ts
    │   ├── migrations/           # Database migrations
    │   │   └── 1000000000000-InitialSchema.ts
    │   ├── data-source.ts        # TypeORM configuration
    │   └── index.ts              # Express app entry point
    ├── .env                      # Database credentials
    ├── package.json
    ├── tsconfig.json
    └── POSTGRES_SETUP.md         # Detailed setup guide
```

---

## 🧪 Testing the Connection

### Test 1: Backend Health
```bash
curl http://localhost:5000/api/health
# Response: {"success":true,"message":"Backend is running"}
```

### Test 2: Create Sales Entry
```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNo": "TEST-001",
    "customerName": "Test Customer",
    "date": "2024-04-09",
    "total": 1000,
    "items": []
  }'
```

### Test 3: Get All Sales
```bash
curl http://localhost:5000/api/sales
```

### Test 4: Via Frontend
1. Open `http://localhost:5173`
2. Navigate to Sales Entry
3. Create → Save → Edit → Delete
4. All operations should work with toast notifications

---

## 🎓 Technology Stack Explained

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + TypeScript | Component-based UI, type safety |
| State | React Query v5 | Real-time data sync, caching, mutations |
| API | REST with Fetch | Simple, standard, widely used |
| Backend | Express.js | Lightweight, popular, easy to learn |
| Database | PostgreSQL | Relational, reliable, open-source |
| ORM | TypeORM | Type-safe, migrations, relationships |
| UI Components | ShadCN UI | Beautiful, accessible, shadcn/ui design |

---

## 🚢 Deployment Checklist

- [ ] PostgreSQL server provisioned (AWS RDS, DigitalOcean, etc.)
- [ ] Environment variables configured
- [ ] Backend migrations run: `npm run migration:run`
- [ ] Frontend build: `npm run build`
- [ ] Backend compiled: `npm run build`
- [ ] Testing in production environment
- [ ] CORS and security headers reviewed
- [ ] Error logging configured
- [ ] Backups scheduled

---

## 📞 Support & Troubleshooting

### Frontend Won't Connect to Backend
- Check backend is running: `http://localhost:5000/api/health`
- Verify `.env` VITE_API_URL matches backend port
- Check browser console for CORS errors

### Data Not Persisting
- Verify migrations ran: `npm run migration:run`
- Check PostgreSQL is running
- Review backend logs for errors

### Database Errors
- Ensure database `smartpos_db` exists
- Check credentials in `.env`
- Verify PostgreSQL service is running

---

## ✅ You Have:

✅ Fully typed frontend ready to connect  
✅ Express.js backend with 6 complete API modules  
✅ PostgreSQL with 11 pre-built tables  
✅ TypeORM migrations for reproducible schema  
✅ Real-time CRUD with data persistence  
✅ Error handling and user notifications  
✅ Complete documentation  

**Everything is ready. Just follow the 5-step setup and you're done!**
