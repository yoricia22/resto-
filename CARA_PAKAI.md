# 🎉 BACKEND RESTO - LENGKAP & SIAP PAKAI!

## ✅ Yang Sudah Dibuat

### Backend (Express.js + Node.js)
- ✅ Server API lengkap dengan Express.js
- ✅ Database file-based (database.json) - **TIDAK PERLU MYSQL!**
- ✅ Sistem migrasi otomatis seperti Laravel
- ✅ Authentication dengan JWT
- ✅ Password hashing dengan bcrypt
- ✅ CORS enabled
- ✅ Auto-migration saat server start

### API Endpoints
- ✅ `POST /api/register` - Daftar user baru
- ✅ `POST /api/login` - Login user
- ✅ `GET /api/profile` - Get user profile (protected)

### Frontend (Ionic Vue)
- ✅ Halaman Login lengkap
- ✅ Halaman Register lengkap
- ✅ Auth service
- ✅ Router configuration
- ✅ Form validation
- ✅ Error handling
- ✅ Auto redirect after login

### Database
- ✅ Tabel users dengan fields: id, name, email, password, created_at, updated_at
- ✅ Tabel migrations untuk tracking
- ✅ Auto-create database file
- ✅ Data persisten di database.json

---

## 🚀 CARA MENJALANKAN

### 1. Backend (WAJIB JALAN DULU!)

```powershell
cd backend
npm install
npm start
```

Server akan jalan di: **http://localhost:8000**

### 2. Frontend

Terminal baru:
```powershell
cd ..
npm install
npm run dev
```

Frontend akan jalan di: **http://localhost:5173** (atau port lain)

---

## 🧪 TEST API

Buka di browser: **http://localhost:8000/test-api.html**

Di halaman test ini Anda bisa:
1. Test Register - buat user baru
2. Test Login - login dengan user yang sudah dibuat
3. Test Get Profile - ambil data profile user (harus login dulu)
4. Lihat isi database

---

## 📊 STRUKTUR DATABASE

File: `backend/database.json`

```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@test.com",
      "password": "$2a$10$...", // hashed password
      "created_at": "2026-01-10T...",
      "updated_at": "2026-01-10T..."
    }
  ],
  "migrations": [
    {
      "name": "001_create_users_table.sql",
      "executed_at": "2026-01-10T..."
    }
  ]
}
```

---

## 📁 STRUKTUR FILE BACKEND

```
backend/
├── config/
│   └── database.js          # Database connection & queries
├── controllers/
│   └── authController.js    # Register, Login, Profile logic
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── migrations/
│   ├── migrate.js           # Migration runner
│   └── 001_create_users_table.sql
├── models/
│   └── User.js              # User model
├── routes/
│   └── auth.js              # API routes
├── .env                     # Environment variables
├── server.js                # Main server file
├── database.json            # Database file (auto-created)
└── test-api.html            # Test page
```

---

## 🔧 ENVIRONMENT VARIABLES

File: `backend/.env`

```env
# Gunakan file-based database (tidak perlu MySQL)
USE_FILE_DB=true

# JWT Secret Key
JWT_SECRET=resto-secret-key-2026
JWT_EXPIRES_IN=7d

# Server Port
PORT=8000
```

---

## 🎯 CARA PAKAI DI APLIKASI

### 1. Register User Baru

**Request:**
```javascript
POST http://localhost:8000/api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

**Response Success:**
```json
{
  "message": "Registrasi berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 2. Login

**Request:**
```javascript
POST http://localhost:8000/api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "123456"
}
```

**Response Success:**
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 3. Get Profile (Protected)

**Request:**
```javascript
GET http://localhost:8000/api/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response Success:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-01-10T..."
  }
}
```

---

## 💡 FITUR KEAMANAN

- ✅ Password di-hash dengan bcrypt (tidak disimpan plain text)
- ✅ JWT Token untuk authentication
- ✅ Protected routes dengan middleware
- ✅ Token expiry (7 hari)
- ✅ Input validation
- ✅ Error handling

---

## 🔄 MENAMBAH TABEL BARU (MIGRASI)

Buat file baru di `backend/migrations/`:

**File:** `002_create_products_table.sql`

```sql
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Restart server, migrasi akan otomatis jalan!

---

## 🐛 TROUBLESHOOTING

### Port 8000 sudah dipakai?

Edit `backend/.env`:
```env
PORT=3000
```

Dan update di `src/services/authService.js`:
```javascript
const API_URL = 'http://127.0.0.1:3000/api'
```

### Server tidak jalan?

```powershell
# Stop semua proses node
Get-Process -Name node | Stop-Process -Force

# Jalankan ulang
cd backend
npm start
```

### Database corrupt?

```powershell
# Hapus dan buat ulang
cd backend
Remove-Item database.json
npm start
```

---

## 📝 TESTING

### Test Register di Aplikasi:
1. Buka aplikasi Ionic
2. Klik "Daftar disini"
3. Isi form: Nama, Email, Password
4. Klik "Daftar"
5. Auto redirect ke home jika berhasil

### Test Login di Aplikasi:
1. Buka aplikasi Ionic
2. Isi Email & Password
3. Klik "Login"
4. Auto redirect ke home jika berhasil

---

## 🎊 KESIMPULAN

Backend sudah **100% LENGKAP** dan **SIAP PAKAI**:
- ✅ Tidak perlu install MySQL
- ✅ Auto-migration
- ✅ Register & Login working
- ✅ Database persistent
- ✅ Frontend integrated
- ✅ Test page tersedia

**SEMUANYA SUDAH JALAN!** 🚀🎉
