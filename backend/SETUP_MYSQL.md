# Setup Database MySQL

## 1. Buat Database

Jalankan command ini di MySQL:

```sql
CREATE DATABASE resto_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Atau lewat phpMyAdmin / MySQL Workbench, buat database bernama `resto_db`

## 2. Update Password MySQL (jika ada)

Edit file `backend/.env`:
```
DB_PASSWORD=password_mysql_anda
```

## 3. Jalankan Migrasi

```bash
cd backend
npm start migrate
```

## 4. Jalankan Server

```bash
npm start
```

---

## Alternatif: Setup MySQL lewat Command Line

### Windows (dengan MySQL terinstall):

```powershell
# Masuk ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE resto_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Keluar
exit;
```

### Atau jalankan langsung:

```powershell
mysql -u root -p -e "CREATE DATABASE resto_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```
