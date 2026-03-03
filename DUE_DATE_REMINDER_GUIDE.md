# Due Date & Reminder Feature Guide

## ✅ Đã Thêm Tính Năng

### 1. **Prisma Schema** - Đã cập nhật
- `dueDate` - Ngày deadline (Date)
- `reminder` - Thời gian nhắc nhở (DateTime)
- `reminderSent` - Đánh dấu đã gửi reminder (Boolean)

### 2. **Yup Validation** - Đã cập nhật
- Validate dueDate không được trong quá khứ
- Validate reminder phải trong tương lai
- Validate reminder phải trước dueDate

### 3. **CreateTaskForm** - Đã thêm fields
- Due Date (date picker)
- Reminder (datetime-local picker)

### 4. **API Reminders** - `/api/reminders`
- GET: Lấy danh sách reminders sắp đến hạn
- POST: Đánh dấu reminder đã gửi

### 5. **ReminderNotification Component**
- Tự động kiểm tra reminders mỗi phút
- Hiển thị toast notification
- Hiển thị panel reminders

---

## 🚀 Các Bước Cần Làm

### Bước 1: Chạy Migration (BẮT BUỘC)

```bash
cd task-manager-app

# Xóa migration cũ (nếu có)
rm -rf prisma/migrations

# Tạo migration mới
npx prisma migrate dev --name add_due_date_reminder

# Generate Prisma Client
npx prisma generate
```

### Bước 2: Thêm ReminderNotification vào Layout

Mở `app/layout.tsx` và thêm:

```tsx
import ReminderNotification from "./components/Reminders/ReminderNotification";

// Trong component, thêm vào sau <ContextProvider>:
<ReminderNotification />
```

### Bước 3: Chạy Ứng Dụng

```bash
npm run dev
```

---

## 📋 Cách Sử Dụng

### Tạo Task với Due Date & Reminder:

1. Click **"Add Task"** hoặc **"+"**
2. Điền thông tin task
3. Chọn **"Due Date"** - ngày deadline
4. Chọn **"Reminder"** - ngày giờ nhắc nhở (phải trước due date)
5. Click **"Create Task"**

### Reminder sẽ tự động:
- Kiểm tra mỗi **1 phút**
- Hiển thị **toast notification** khi đến giờ
- Hiển thị **panel reminders** ở góc phải
- Chỉ nhắc **1 lần** (đánh dấu reminderSent = true)

---

## 🗄️ Database Schema

```prisma
model Task {
  id           String    @id @default(cuid())
  title        String
  description  String?
  date         String
  dueDate      DateTime? @db.Date      // 📅 Due Date
  reminder     DateTime? @db.DateTime  // ⏰ Reminder
  reminderSent Boolean   @default(false)
  // ... other fields
}
```

---

## ✅ Kiểm Tra

1. Tạo task với due date và reminder
2. Đợi đến thời gian reminder (hoặc set reminder gần hiện tại)
3. Xem toast notification hiện lên
4. Xem panel reminders ở góc phải

**Due Date & Reminder đã sẵn sàng!** 🎉
