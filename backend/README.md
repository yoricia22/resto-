# Backend - Resto App

## 🚀 Quick Start (No MySQL Required!)

Backend ini sudah dikonfigurasi untuk **langsung jalan** tanpa perlu install MySQL!

### Setup & Run:

```bash
cd backend
npm install
npm start
```

Selesai! Server akan:
- ✅ Auto-start di http://localhost:8000
- ✅ Auto-create database file (`database.json`)
- ✅ Auto-run migrations
- ✅ Siap menerima request Register & Login

---

## 📊 Database Options

### Opsi 1: File-Based Database (Default - Recommended)

**Tidak perlu install apapun!** Data disimpan di `database.json`

Edit `.env`:
```env
USE_FILE_DB=true
```

### Opsi 2: MySQL Database

Jika ingin pakai MySQL:

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Buat database MySQL:**

Lewat phpMyAdmin (XAMPP) atau MySQL Workbench:
```sql
CREATE DATABASE resto_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Atau lewat command line:
```bash
mysql -u root -p -e "CREATE DATABASE resto_db;"
```

3. **Konfigurasi database:**

Edit file `.env` jika perlu ubah password MySQL:
```env
DB_PASSWORD=your_mysql_password
```

4. **Jalankan migrasi database:**
```bash
npm start migrate
```

5. **Jalankan server:**
```bash
npm start
```

Atau untuk development dengan auto-reload:
```bash
npm run dev
```

Server akan berjalan di: **http://localhost:8000**

## API Endpoints

### Public Endpoints

#### Register
```
POST /api/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```
POST /api/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
```

### Protected Endpoints (Requires Token)

#### Get Profile
```
GET /api/profile
Headers: {
  "Authorization": "Bearer YOUR_TOKEN"
}
```

## Database Migration

Sistem migrasi bekerja seperti Laravel:
- File migrasi ada di folder `migrations/`
- Format nama: `001_create_users_table.sql`, `002_add_column.sql`, dst
- Jalankan dengan: `npm start migrate`
- Migrasi yang sudah dijalankan tidak akan dijalankan lagi

## Database Configuration

### SQLite (Default)
Tidak perlu setup tambahan. Database file akan dibuat otomatis di `database.sqlite`

### MySQL
1. Buat database di MySQL:
```sql
CREATE DATABASE resto_db;
```

2. Update `.env`:
```
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=resto_db
DB_USER=root
DB_PASSWORD=your_password
```

## Testing

Test dengan curl atau Postman:

```bash
# Register
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"123456"}'
```
