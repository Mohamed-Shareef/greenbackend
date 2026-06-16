# SmartPOS Backend Setup Guide

Complete PostgreSQL + Node.js/Express backend with TypeORM migrations and real-time CRUD operations.

## 📋 Required Prerequisites

- **PostgreSQL**: Version 12 or higher
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher

## 🚀 Quick Start (5 minutes)

### Step 1: Install PostgreSQL

**Windows:**
```bash
# Using Chocolatey (recommended)
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

### Step 2: Create Database

Open PostgreSQL command line and run:

```sql
-- Create database
CREATE DATABASE smartpos_db;

-- Create or verify user
CREATE USER postgres WITH PASSWORD 'postgres';
ALTER USER postgres SUPERUSER;
```

Or use pgAdmin GUI (easier):
1. Right-click "Databases" → Create → Database
2. Name: `smartpos_db`
3. Owner: `postgres`

### Step 3: Install Dependencies

```bash
cd backend
npm install
```

### Step 4: Configure Environment

Edit `.env` in backend folder:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=smartpos_db

# Server
NODE_ENV=development
PORT=5000

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Step 5: Run Migrations

Create all tables automatically:

```bash
npm run migration:run
```

### Step 6: Start Backend

```bash
npm run dev
```

Expected output:
```
✓ Database connected successfully
✓ Server running on http://localhost:5000
✓ Frontend URL: http://localhost:5173
```

---

## 📊 Database Schema

### Tables Created:

1. **sales** - Customer invoices
   - Fields: id, invoiceNo, customerName, date, total, createdAt, updatedAt
   - Relations: 1:N with sale_items

2. **sale_items** - Line items for sales
   - Fields: id, productName, quantity, unitPrice, amount, saleId, createdAt

3. **purchase_orders** - Purchase orders to suppliers
   - Fields: id, poNumber, supplierName, date, total, createdAt, updatedAt
   - Relations: 1:N with order_items

4. **order_items** - Line items for purchase orders
   - Fields: id, productName, quantity, unitPrice, amount, purchaseOrderId, createdAt

5. **purchases** - Supplier bills received
   - Fields: id, billNo, supplierName, date, total, createdAt, updatedAt
   - Relations: 1:N with purchase_items

6. **purchase_items** - Line items for purchases
   - Fields: id, productName, quantity, unitPrice, amount, purchaseId, createdAt

7. **purchase_returns** - Returns to suppliers
   - Fields: id, returnNo, supplierName, date, total, reason, createdAt, updatedAt
   - Relations: 1:N with purchase_return_items

8. **purchase_return_items** - Line items for purchase returns
   - Fields: id, productName, quantity, unitPrice, amount, purchaseReturnId, createdAt

9. **sale_returns** - Returns from customers
   - Fields: id, returnNo, customerName, date, total, reason, createdAt, updatedAt
   - Relations: 1:N with sale_return_items

10. **sale_return_items** - Line items for sale returns
    - Fields: id, productName, quantity, unitPrice, amount, saleReturnId, createdAt

11. **stock** - Inventory items
    - Fields: id, itemName, category, quantity, unitPrice, totalValue, createdAt, updatedAt

---

## 🔌 API Endpoints

### Sales

```bash
GET    /api/sales              # Get all sales
GET    /api/sales/:id          # Get single sale
POST   /api/sales              # Create sale
PUT    /api/sales/:id          # Update sale
DELETE /api/sales/:id          # Delete sale
```

### Purchase Orders

```bash
GET    /api/purchaseOrders     # Get all POs
GET    /api/purchaseOrders/:id # Get single PO
POST   /api/purchaseOrders     # Create PO
PUT    /api/purchaseOrders/:id # Update PO
DELETE /api/purchaseOrders/:id # Delete PO
```

### Purchases

```bash
GET    /api/purchases          # Get all purchases
GET    /api/purchases/:id      # Get single purchase
POST   /api/purchases          # Create purchase
PUT    /api/purchases/:id      # Update purchase
DELETE /api/purchases/:id      # Delete purchase
```

### Purchase Returns

```bash
GET    /api/purchaseReturns    # Get all purchase returns
GET    /api/purchaseReturns/:id # Get single return
POST   /api/purchaseReturns    # Create purchase return
PUT    /api/purchaseReturns/:id # Update purchase return
DELETE /api/purchaseReturns/:id # Delete purchase return
```

### Sale Returns

```bash
GET    /api/saleReturns        # Get all sale returns
GET    /api/saleReturns/:id    # Get single return
POST   /api/saleReturns        # Create sale return
PUT    /api/saleReturns/:id    # Update sale return
DELETE /api/saleReturns/:id    # Delete sale return
```

### Stock

```bash
GET    /api/stock              # Get all stock items
GET    /api/stock/:id          # Get single stock item
POST   /api/stock              # Create stock item
PUT    /api/stock/:id          # Update stock item
DELETE /api/stock/:id          # Delete stock item
```

### Health Check

```bash
GET    /api/health             # Check if backend is running
```

---

## 📝 Sample API Requests

### Create Sale

```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNo": "INV-001",
    "customerName": "John Doe",
    "date": "2024-04-09",
    "total": 2500,
    "items": [
      {
        "productName": "Product A",
        "quantity": 2,
        "unitPrice": 1000,
        "amount": 2000
      }
    ]
  }'
```

### Update Sale

```bash
curl -X PUT http://localhost:5000/api/sales/{saleId} \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNo": "INV-001",
    "customerName": "Jane Doe",
    "date": "2024-04-09",
    "total": 3000,
    "items": [...]
  }'
```

### Delete Sale

```bash
curl -X DELETE http://localhost:5000/api/sales/{saleId}
```

---

## 🔍 Verify Connection

Check if databases is connected:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"success":true,"message":"Backend is running"}
```

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- PostgreSQL service is not running
- Correct credentials in `.env` file
- Database `smartpos_db` exists
- Port 5432 is accessible

**Solution:**
```bash
# Windows - Start PostgreSQL service
net start postgresql-x64-15

# macOS
brew services start postgresql@15

# Ubuntu/Linux
sudo service postgresql start
```

### "Table already exists" during migration
- Migration already ran
- Safe to ignore or reset:
```bash
npm run migration:revert
npm run migration:run
```

### "CORS error from frontend"
- Update `FRONTEND_URL` in `.env`:
```env
FRONTEND_URL=http://localhost:5173
```

### "Port 5000 already in use"
- Change PORT in `.env`:
```env
PORT=5000
```

Then update frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔄 Migration Commands

```bash
# Run all pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate new migration (after entity changes)
npm run migration:generate -- -n MigrationName
```

---

## 📦 Production Deployment

When deploying to production:

1. Set environment to production:
```env
NODE_ENV=production
```

2. Use environment variables from cloud provider (AWS, Heroku, etc.)

3. Run migrations:
```bash
npm run migration:run
```

4. Build TypeScript:
```bash
npm run build
npm start
```

---

## 📚 Technology Stack

- **Express.js** - Web framework
- **TypeORM** - ORM with migrations
- **PostgreSQL** - Database
- **TypeScript** - Type safety
- **CORS** - Cross-origin requests

---

## 🎯 Next Steps

1. ✅ Backend running on `http://localhost:5000`
2. ✅ Database tables created and connected
3. ⏭️  Start frontend: `npm run dev` (in greenwave-ui-builder)
4. ⏭️  Test CRUD operations
5. ⏭️  Verify data persists in PostgreSQL

---

**Need help?** Check the terminal output for detailed error messages or review the table schemas in pgAdmin.
