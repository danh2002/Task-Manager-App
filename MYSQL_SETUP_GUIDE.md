# Hướng Dẫn Kết Nối MySQL (BẮT BUỘC)

## ✅ Đã Cấu Hình Xong

- [x] `prisma/schema.prisma` - Đã chuyển từ SQLite sang MySQL
- [x] `.env.example` - File mẫu cấu hình database

---

## 📝 Các Bước Thực Hiện

### Bước 1: Cài Đặt MySQL Driver

```bash
cd task-manager-app
npm install @prisma/client
```

### Bước 2: Tạo File `.env`

Copy file `.env.example` thành `.env`:

**Windows:**
```cmd
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

### Bước 3: Sửa File `.env`

Mở file `.env` và sửa dòng DATABASE_URL:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/taskmanager"
```

**Thay thế:**
- `root` → Tên user MySQL của bạn
- `YOUR_PASSWORD` → Mật khẩu MySQL
- `localhost` → Host (nếu remote thì đổi IP)
- `3306` → Port (mặc định 3306)
- `taskmanager` → Tên database

**Ví dụ:**
```env
DATABASE_URL="mysql://admin:123456@localhost:3306/taskmanager"
```

### Bước 4: Tạo Database trong MySQL

Mở **MySQL Workbench** hoặc **Command Line** và chạy:

```sql
CREATE DATABASE taskmanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Bước 5: Xóa Migration Cũ (Nếu Có)

```bash
# Windows
rmdir /s /q prisma\migrations

# Mac/Linux
rm -rf prisma/migrations
```

### Bước 6: Tạo Migration Mới

```bash
npx prisma migrate dev --name init
```

Khi được hỏi, nhập: `y`

### Bước 7: Generate Prisma Client

```bash
npx prisma generate
```

### Bước 8: Kiểm Tra Kết Nối

```bash
npx prisma db pull
```

Nếu không có lỗi → **Kết nối thành công!** ✅

### Bước 9: Chạy Ứng Dụng

```bash
npm run dev
```

---

## 🔧 Xử Lý Lỗi Thường Gặp

### Lỗi 1: "Can't reach database server"

**Nguyên nhân:** MySQL chưa chạy hoặc sai thông tin kết nối

**Cách fix:**
1. Kiểm tra MySQL đang chạy: Services → MySQL80 → Start
2. Kiểm tra lại user/password trong `.env`

### Lỗi 2: "Access denied for user"

**Nguyên nhân:** Sai user hoặc password

**Cách fix:**
```sql
-- Tạo user mới nếu cần
CREATE USER 'taskuser'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON taskmanager.* TO 'taskuser'@'localhost';
FLUSH PRIVILEGES;
```

### Lỗi 3: "Database does not exist"

**Nguyên nhân:** Chưa tạo database

**Cách fix:**
```sql
CREATE DATABASE taskmanager;
```

---

## 📋 Kiểm Tra Nhanh

Sau khi setup xong, chạy lệnh:

```bash
npx prisma studio
```

Mở browser tại `http://localhost:5555` để xem database.

---

## ✅ Hoàn Thành

Khi thấy dòng này là thành công:
```
Your database is now in sync with your schema.
```

**Prisma + MySQL đã sẵn sàng!** 🎉
