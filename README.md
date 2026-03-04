# Task Manager App (Next.js 14 + Clerk + Prisma)

Ứng dụng quản lý công việc theo mô hình Board/Column/Task, có kéo-thả (drag & drop), nhãn (labels), checklist, phân công thành viên, bình luận, nhắc việc (reminder), và import/export dữ liệu.

## 1) Mục tiêu dự án

- Quản lý công việc theo board giống kanban.
- Tập trung vào luồng làm việc thực tế: tạo board -> tạo cột -> tạo task -> kéo thả task giữa cột -> theo dõi tiến độ.
- Hỗ trợ nhiều nhu cầu vận hành: tags, comments, reminders, xuất/nhập dữ liệu.
- Tách rõ frontend state và backend API theo App Router.

## 2) Stack công nghệ

- `Next.js 14` (App Router)
- `React 18` + `TypeScript`
- `styled-components` cho UI styling
- `@dnd-kit/*` cho drag & drop
- `Formik + Yup` cho form và validation
- `Prisma` + `SQLite` (mặc định) cho dữ liệu
- `Clerk` cho authentication
- `axios` cho client API calls
- `react-hot-toast` cho feedback UI

## 3) Kiến trúc tổng thể

### 3.1 Client architecture

- Entry layout: `app/layout.tsx`
- Chuỗi provider:
  - `ClerkProvider`
  - `ThemeProvider`
  - `ContextProvider` (bọc `GlobalProvider` + `Toaster`)
  - `GlobalStyleProvider`
- State chia sẻ toàn app nằm trong `app/context/globalProvider.js`.
- UI modules chính:
  - Board list: `app/components/Board/BoardList.tsx`
  - Board detail + DnD: `app/components/Board/BoardView.tsx`
  - Task card: `app/components/TaskItem/TaskItem.tsx`
  - Task forms: `app/components/Forms/*`

### 3.2 Server architecture

- API routes theo App Router: `app/api/**/route.ts`
- Auth check bằng `getAuth(req)` trong từng handler.
- Chuẩn response dùng `successResponse`/`errorResponse` trong `app/lib/api-response.ts`.
- DB client singleton: `app/lib/prisma.ts`.

### 3.3 Data layer (Prisma)

Schema chính trong `prisma/schema.prisma`:

- `Board`: workspace cấp cao.
- `Column`: cột workflow (To Do, In Progress, Done...).
- `Task`: đơn vị công việc chính.
- `Label`: tag theo board.
- `Comment`: thảo luận trên task.
- `ActivityLog`: lịch sử thao tác task.

Quan hệ chính:

- `Board 1-n Column`
- `Board 1-n Task`
- `Column 1-n Task`
- `Task n-n Label`
- `Task 1-n Comment`
- `Task 1-n ActivityLog`

## 4) Luồng nghiệp vụ chính

### 4.1 Tạo board + cột mặc định

- UI gọi `createBoard` trong global provider.
- API `POST /api/boards`:
  - validate dữ liệu bằng `boardValidationSchema`
  - tạo board mới
  - tự động tạo 3 cột mặc định:
    - `To Do`
    - `In Progress`
    - `Done`

### 4.2 Tạo/sửa/xóa task

- Tạo task: `CreateTaskForm` -> `POST /api/tasks`
- Sửa task: `CreateTaskForm`/`EditTaskForm` -> `PUT /api/tasks` hoặc `PUT /api/tasks/[id]`
- Xóa task: `DELETE /api/tasks/[id]` (hoặc route query theo ngữ cảnh)
- Validation áp dụng cả client + server (Yup).

### 4.3 Drag & drop task giữa cột

- DnD setup trong `BoardView.tsx` với `DndContext + SortableContext`.
- Delay kích hoạt drag được cấu hình bởi `PointerSensor`:
  - `activationConstraint: { delay: 20, tolerance: 6 }`
- Khi kéo sang cột Done, task được cập nhật `isCompleted = true`.
- Khi kéo ra khỏi Done, task có thể bị uncomplete tùy cột nguồn/đích.
- Cập nhật backend bằng `PUT /api/tasks/[id]`.

### 4.4 Reminder polling + desktop notification

- Component `ReminderNotification.tsx` poll `/api/reminders` mỗi 5 giây.
- Lọc reminder gần thời điểm hiện tại và chưa xử lý.
- Trigger:
  - âm thanh
  - desktop notification (nếu được cấp quyền)
  - toast trong app
- Ghi nhận đã gửi bằng API POST reminders (xem lưu ý ở phần FAQ).

### 4.5 Export / import dữ liệu

- UI: `ExportImport.tsx`
- Export: `GET /api/export`
- Import: `POST /api/export`
- Hỗ trợ JSON (core), CSV (logic parse đơn giản ở client).

## 5) Cấu trúc thư mục chính

- `app/`
  - `api/`: route handlers backend
  - `components/`: UI components
  - `context/`: global state
  - `lib/`: prisma, response helpers, schemas
  - `providers/`: provider wrappers
  - `utils/`: tiện ích dùng lại
- `prisma/`
  - `schema.prisma`
  - `migrations/`
- `middleware.ts`: auth middleware của Clerk

## 6) Cài đặt và chạy dự án

### 6.1 Yêu cầu môi trường

- Node.js 18+
- npm 9+

### 6.2 Cài dependencies

```bash
npm install
```

### 6.3 Cấu hình biến môi trường

Tạo file `.env.local` (hoặc `.env`) với tối thiểu:

```env
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."
```

Nếu dùng SQLite local, giữ đúng `DATABASE_URL` trỏ tới file DB.

### 6.4 Khởi tạo Prisma

```bash
npx prisma migrate dev
npx prisma generate
```

### 6.5 Chạy app

```bash
npm run dev
```

Build production:

```bash
npm run build
npm run start
```

## 7) API overview nhanh

- `GET/POST/PUT/DELETE /api/tasks`
- `GET/PUT/DELETE /api/tasks/[id]`
- `GET/POST/PUT /api/boards`
- `GET/DELETE /api/boards/[id]`
- `GET/POST/PUT/DELETE /api/columns`
- `GET/POST/PUT/DELETE /api/labels`
- `GET/POST/DELETE /api/comments`
- `GET/POST /api/activity-logs`
- `GET/POST /api/reminders`
- `GET/POST /api/export`
- `GET /api/health`

Chi tiết từng function: xem thư mục `docs/functions/`.

## 8) Chỉ mục tài liệu function

- [00-index](docs/functions/00-index.md)
- [01-app-routing-layout](docs/functions/01-app-routing-layout.md)
- [02-context-global-provider](docs/functions/02-context-global-provider.md)
- [03-api-reference](docs/functions/03-api-reference.md)
- [04-board-task-ui](docs/functions/04-board-task-ui.md)
- [05-reminder-comments-export](docs/functions/05-reminder-comments-export.md)
- [06-providers-utils](docs/functions/06-providers-utils.md)

## 9) FAQ / lỗi thường gặp

### 9.1 Unauthorized từ API

- Đảm bảo user đã đăng nhập Clerk.
- Kiểm tra middleware và keys Clerk trong env.

### 9.2 Prisma schema mismatch (đặc biệt checklist/reminder)

- Chạy lại:

```bash
npx prisma migrate dev
npx prisma generate
```

### 9.3 Date / timezone lệch giờ

- `dueDate` và `reminder` được parse về `Date` server-side.
- Khi nhập `YYYY-MM-DD` hoặc `YYYY-MM-DDTHH:mm`, server thêm phần thời gian chuẩn trước khi lưu.
- Cần thống nhất timezone hiển thị ở client nếu mở rộng sản phẩm đa vùng.

### 9.4 Reminder không được đánh dấu đã gửi

- Hiện tại UI gọi endpoint `POST /api/reminders/mark-sent`, nhưng route server công khai là `POST /api/reminders`.
- Cần đồng bộ endpoint để tránh reminder bị lặp thông báo.

## 10) Ghi chú phạm vi tài liệu

- Tài liệu này chỉ bao phủ app chính `task-manager-app`.
- Thư mục `clerk-nextjs/` không nằm trong scope function reference chi tiết.
