# TODO: Fix Task Priority Display Issue

## Problem
Khi chỉnh task thành low hoặc high, nhưng vẫn hiển thị mặc định là medium

## Root Cause
- **taskValidationSchema.ts có `.default("medium")` cho priority field** - Đây là nguyên nhân chính!
  - Khi Yup validate dữ liệu, `.default("medium")` ghi đè giá trị thực tế từ form
  - Dù form gửi "high" hay "low", sau validation đều thành "medium"
- TaskItem.tsx có logic normalize nhưng chưa đủ strict
- Thiếu debug logging để trace luồng dữ liệu


## Steps to Fix (ĐÃ HOÀN THÀNH)

- [x] 1. Create TODO file
- [x] 2. **FIX CHÍNH: taskValidationSchema.ts - Xóa `.default("medium")`**
- [x] 3. Fix TaskItem.tsx - Thêm strict priority handling với normalizePriority function
- [x] 4. Fix Tasks.tsx - Thêm debug logging để kiểm tra dữ liệu từ API
- [x] 5. Fix globalProvider.js - Thêm debug logging khi fetch tasks
- [x] 6. Fix EditTaskForm.tsx - Thêm debug logging để kiểm tra task object
- [x] 7. Fix API route.ts - Thêm strict check cho priority
- [x] 8. Test the fix - Ready for testing


## Summary of Changes

### 1. **taskValidationSchema.ts - FIX CHÍNH** ✅
- **Xóa `.default("medium")` khỏi priority field**
- Đây là nguyên nhân gốc rễ: Yup đang ghi đè giá trị thực tế bằng default value
- Giờ priority sẽ giữ nguyên giá trị từ form ("low", "medium", "high")

### 2. TaskItem.tsx
- Thêm `normalizePriority` function strict hơn để validate priority value
- Thêm debug logging chi tiết: `[TaskItem] Raw priority` và `[TaskItem] Final normalized priority`
- Thêm `data-priority` attribute để dễ inspect trong DevTools
- Cải thiện styling cho priority badge (uppercase, letter-spacing)

### 3. Tasks.tsx
- Thêm `useEffect` để log tasks data từ API
- Debug log hiển thị: id, title, priority, priorityType cho mỗi task

### 4. globalProvider.js
- Thêm debug logging trong `allTasks()` function
- Log raw tasks data từ API response để kiểm tra priority field

### 5. EditTaskForm.tsx
- Thêm debug logging khi nhận task object: `[EditTaskForm] Task received`
- Log priority value và type để kiểm tra dữ liệu từ editingTask

### 6. API route.ts
- Thêm strict check cho priority trong POST handler
- Log chi tiết priority value trước khi create/update


## Cách Debug

1. Mở Browser DevTools (F12) -> Console
2. Refresh trang và kiểm tra các log sau:
   - `[globalProvider] Raw tasks from API:` - Xem priority từ API
   - `[Tasks] Tasks data from API:` - Xem priority trước khi truyền vào TaskItem
   - `[TaskItem] Raw priority for "XXX":` - Xem priority TaskItem nhận được
   - `[TaskItem] Final normalized priority:` - Xem priority sau khi normalize
   - `[EditTaskForm] Task received:` - Xem priority khi mở edit modal

## Root Cause Analysis
**Vấn đề chính xác định:**
- Yup validation schema có `.default("medium")` cho priority field
- Khi `taskValidationSchema.validate()` được gọi trong API, Yup áp dụng default value
- Dù client gửi "high" hay "low", sau validation đều thành "medium"
- Database chỉ nhận được "medium" nên API chỉ trả về "medium"

**Luồng lỗi:**
```
Form (gửi "high") → API nhận "high" → Yup validate → default("medium") → Prisma create với "medium" → DB lưu "medium" → API trả về "medium" → UI hiển thị "medium"
```

**Fix:**
```
Form (gửi "high") → API nhận "high" → Yup validate (không default) → Prisma create với "high" → DB lưu "high" → API trả về "high" → UI hiển thị "high" ✅
```


## Files Đã Edit
1. ✅ **`task-manager-app/app/lib/validations/taskSchema.ts` - FIX CHÍNH**
2. ✅ `task-manager-app/app/api/tasks/route.ts` - Thêm strict check
3. ✅ `task-manager-app/app/components/TaskItem/TaskItem.tsx`
4. ✅ `task-manager-app/app/components/Tasks/Tasks.tsx`
5. ✅ `task-manager-app/app/context/globalProvider.js`
6. ✅ `task-manager-app/app/components/Forms/EditTaskForm.tsx`


## Next Steps
1. Chạy app và kiểm tra console logs
2. Tạo task mới với priority = high/low
3. Kiểm tra xem priority hiển thị đúng không
4. Edit task và đổi priority, kiểm tra lại
5. Nếu vẫn lỗi, dựa vào logs để xác định nguyên nhân
