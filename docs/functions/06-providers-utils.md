# 06 - Providers, Libs, Utils, Schemas

## A) Providers (`app/providers/*`)

### 1) `useTheme()`
- File: `app/providers/ThemeProvider.tsx`
- Vai trò: custom hook đọc theme context.
- Guard: throw error nếu dùng ngoài `ThemeProvider`.

### 2) `toggleTheme()` (trong `ThemeProvider`)
- File: `app/providers/ThemeProvider.tsx`
- Vai trò: đổi `dark/light` và ghi vào localStorage.
- Side effects: set `data-theme` trên `documentElement`.

### 3) `ThemeProvider({ children })`
- File: `app/providers/ThemeProvider.tsx`
- Vai trò: cung cấp context theme riêng.
- Luồng:
  1. mount đọc localStorage (`dark/light` hoặc legacy `0/1`).
  2. set state theme.
  3. expose `toggleTheme`.

### 4) `ContextProvider({ children })`
- File: `app/providers/ContextProvider.tsx`
- Vai trò: bọc `GlobalProvider` + `Toaster`, có màn loading ngắn.
- Luồng:
  1. `setTimeout(200ms)` rồi set `isReady = true`.
  2. nếu chưa ready -> render spinner.
  3. ready -> render children trong provider tree.

### 5) `GlobalStyleProvider({ children })`
- File: `app/providers/GlobalStyleProvider.tsx`
- Vai trò: wrapper styled container global layout.

### 6) `ChunkErrorHandler()`
- File: `app/providers/ChunkErrorHandler.tsx`
- Vai trò: lắng nghe global error, reload khi lỗi chunk load.

### 7) `handleChunkLoadError(event)`
- File: `app/providers/ChunkErrorHandler.tsx`
- Vai trò: detect thông điệp `Loading chunk`/`ChunkLoadError` và `window.location.reload()`.

### 8) `ClientLayout({ children })`
- File: `app/providers/ClientLayout.tsx`
- Vai trò: client-only layout cũ/alternative shell.
- Ghi chú: app hiện dùng `app/layout.tsx` làm chính.

## B) Lib layer (`app/lib/*`)

### 1) `successResponse(data, status?)`
- File: `app/lib/api-response.ts`
- Vai trò: chuẩn hóa success payload JSON.
- Output shape:
  - `{ success: true, data, status }`

### 2) `errorResponse(error, status?)`
- File: `app/lib/api-response.ts`
- Vai trò: chuẩn hóa error payload JSON.
- Output shape:
  - `{ success: false, error, status }`

### 3) Prisma singleton setup
- File: `app/lib/prisma.ts`
- Vai trò: tránh tạo nhiều PrismaClient khi hot reload dev.
- Ghi chú: dùng `globalForPrisma.prisma` cache nếu không production.

## C) Utility functions (`app/utils/*`)

### 1) `formatDate(date)`
- File: `app/utils/formatDate.js`
- Vai trò: format date thành `DD/MM/YYYY` bằng `moment`.

### 2) `connect.ts`
- Vai trò: Prisma client singleton legacy theo pattern global.
- Ghi chú: phần lớn route mới dùng `app/lib/prisma.ts`.

### 3) `assignees.ts`
- Không có function export dạng khai báo hàm, nhưng có:
  - `TEAM_MEMBERS`: danh sách thành viên mẫu.
  - `MEMBER_BY_ID`: map id -> member, tạo bằng `reduce`.

### 4) `menu.js`
- Không có function nghiệp vụ, chỉ export cấu hình menu.

### 5) `Icons.js`
- Không có function, chỉ export icon JSX constants.

## D) Validation schemas (`app/lib/validations/*`)

### 1) `taskValidationSchema`
- File: `app/lib/validations/taskSchema.ts`
- Vai trò: validate payload task cho forms/API.
- Rule chính:
  - `title`: 3..100 ký tự
  - `description`: tối đa 500 và required
  - `date`: phải parse được ngày hợp lệ
  - `dueDate`: không trong quá khứ
  - `reminder`: tương lai + trước hoặc bằng dueDate (nếu có)
  - `priority`: `low|medium|high`
  - `checklist`: mảng item `{ text, done }`

### 2) `boardValidationSchema`
- File: `app/lib/validations/boardSchema.ts`
- Vai trò: validate board create/update.
- Rule:
  - `name`: required, <= 50
  - `description`: <= 200
  - `color`: hex `#RRGGBB`

### 3) `columnValidationSchema`
- File: `app/lib/validations/boardSchema.ts`
- Vai trò: validate column create/update.
- Rule:
  - `name`: required, <= 30
  - `position`: int >= 0
  - `color`: hex
  - `boardId`: required

### 4) `labelValidationSchema`
- File: `app/lib/validations/labelSchema.ts`
- Vai trò: validate label CRUD payload.
- Rule:
  - `name`: required, <= 30
  - `color`: hex
  - `boardId`: required

## E) Prisma schema entities (tham chiếu nghiệp vụ)

File: `prisma/schema.prisma`

- `Board`, `Column`, `Task`, `Label`, `Comment`, `ActivityLog`
- Mục tiêu:
  - tách ownership bằng `userId`
  - tối ưu truy vấn bằng indexes (`@@index` trên khóa thường lọc)

## F) Cấu hình hệ thống

### 1) `next.config.mjs`
- Thiết lập domain images cho Clerk/local.
- Tùy chỉnh on-demand entries và HTTP headers option.

### 2) `middleware.ts`
- Đã mô tả chi tiết trong `01-app-routing-layout.md`.

## G) Lỗi thường gặp

- Dùng lẫn `app/utils/connect.ts` và `app/lib/prisma.ts` gây khó theo dõi DB client source.
- Legacy theme format (`0/1`) và format mới (`dark/light`) cần đồng bộ nếu thêm provider mới.

## H) Ví dụ sử dụng helpers

### `successResponse`
```ts
return successResponse({ message: "OK" }, 200);
```

### `errorResponse`
```ts
return errorResponse("Unauthorized", 401);
```

### `formatDate`
```js
const label = formatDate(task.createdAt); // 03/03/2026
```
