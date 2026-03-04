# 03 - API Reference (Chi tiết function route handlers)

## Chuẩn chung cho mọi API function

- Auth: hầu hết route yêu cầu `getAuth(req).userId`.
- Response format:
  - Success: `successResponse(data, status?)`
  - Error: `errorResponse(message, status?)`
- DB: dùng singleton Prisma client trong `app/lib/prisma.ts`.

---

## A) `/api/tasks/route.ts`

### 1) `normalizeChecklist(checklist)`
- Vai trò: chuẩn hóa checklist về mảng `{ text, done }` sạch.
- Input: bất kỳ giá trị.
- Output: mảng item hợp lệ, trim text, bỏ item rỗng.
- Guard: nếu không phải mảng -> `[]`.

### 2) `parseChecklist(checklist)`
- Vai trò: parse checklist từ array hoặc JSON string.
- Input: array|string|other.
- Output: mảng checklist normalized.
- Guard: JSON parse fail -> `[]`.

### 3) `normalizeLabelIds(value)`
- Vai trò: convert label ids sang `string[]`.
- Guard: không phải mảng -> `[]`.

### 4) `normalizeAssigneeIds(value)`
- Vai trò: chuẩn hóa assignee ids, loại trùng.
- Output: unique `string[]`.

### 5) `POST(req)`
- Vai trò: tạo task mới.
- Request body quan trọng:
  - `title`, `description`, `date`, `priority`, `boardId?`, `columnId?`, `dueDate?`, `reminder?`, `labelIds?`, `assigneeIds?`, `checklist?`
- Luồng xử lý:
  1. Check auth.
  2. Parse JSON body.
  3. Validate qua `taskValidationSchema`.
  4. Chuẩn hóa priority (`low|medium|high`, fallback `medium`).
  5. Build payload Prisma, stringify checklist/assigneeIds.
  6. Convert `dueDate`/`reminder` sang `Date`.
  7. Validate labels theo user + board.
  8. `prisma.task.create`.
  9. Ghi `activityLog` action `created`.
- Output: task mới (201).
- Guards:
  - Unauthorized -> 401
  - Validation fail -> 400
- Side effects: DB write task + activity.
- Edge cases: date string dạng ngắn được bổ sung time trước khi parse.

### 6) `GET(req)`
- Vai trò: lấy task list có filter/search/pagination.
- Query params hỗ trợ:
  - `search`, `isCompleted`, `isImportant`, `boardId`, `columnId`, `labelId`, `dateFrom`, `dateTo`, `sortBy`, `sortOrder`, `page`, `limit`
- Luồng xử lý:
  1. Check auth.
  2. Build Prisma `where` từ query params.
  3. Count tổng bản ghi.
  4. `findMany` kèm include labels + 3 comment mới nhất.
  5. Trả `tasks + pagination`.
- Output: `{ tasks, pagination }`.
- Edge cases: `sortBy` không hợp lệ có thể gây Prisma runtime error.

### 7) `PUT(req)`
- Vai trò: cập nhật task theo payload có `id`.
- Luồng xử lý:
  1. Check auth + parse body + check `id`.
  2. Verify ownership task.
  3. Validate merged data (existing + update).
  4. Chuẩn hóa checklist/assigneeIds/labelIds.
  5. Parse `dueDate`/`reminder` với hỗ trợ unset (`null`).
  6. `prisma.task.update`.
  7. Ghi activity `updated`.
- Output: task đã cập nhật.
- Guards:
  - Thiếu id -> 400
  - Không sở hữu task -> 404
  - Priority sai -> 400
- Edge cases:
  - Schema DB chưa sync checklist có branch báo lỗi migrate.

### 8) `DELETE(req)`
- Vai trò: xóa task theo query `id`.
- Luồng xử lý:
  1. Check auth.
  2. Lấy `id` từ query.
  3. Verify ownership.
  4. Delete task.
- Output: message success.

---

## B) `/api/tasks/[id]/route.ts`

### 1) `normalizeChecklist` / 2) `normalizeAssigneeIds`
- Vai trò tương tự route collection, dùng cho update theo id path param.

### 3) `PUT(req, { params })`
- Vai trò: update task theo dynamic route id.
- Điểm khác:
  - Validate `boardId` và `columnId` nếu gửi lên.
  - Nếu `boardId/columnId` invalid thì giữ giá trị hiện tại.
- Output: task cập nhật.

### 4) `DELETE(req, { params })`
- Vai trò: xóa task theo id path.
- Guard ownership đầy đủ.

### 5) `GET(req, { params })`
- Vai trò: lấy task đơn lẻ.
- Guard: không sở hữu/không tồn tại -> 404.

---

## C) `/api/boards/route.ts`

### 1) `GET(req)`
- Vai trò: list boards của user.
- Include: `columns` (sort position asc), `_count.tasks`.

### 2) `POST(req)`
- Vai trò: tạo board.
- Validation: `boardValidationSchema`.
- Side effects: tự tạo 3 cột mặc định (`To Do`, `In Progress`, `Done`).
- Output: board + columns.

### 3) `PUT(req)`
- Vai trò: update board theo `id`.
- Guard: ownership trước update.
- Update field linh hoạt (name/description/color nếu có).

---

## D) `/api/boards/[id]/route.ts`

### 1) `GET(req, { params })`
- Vai trò: lấy board chi tiết đầy đủ.
- Include:
  - columns (sort asc)
  - tasks từng column (sort asc)
  - labels
  - `_count.comments` trên task
- Guard: phải đúng owner.

### 2) `DELETE(req, { params })`
- Vai trò: xóa board.
- Guard ownership.
- Side effects: xóa cascade columns/tasks theo schema quan hệ.

---

## E) `/api/columns/route.ts`

### 1) `GET(req)`
- Vai trò: list columns theo `boardId`.
- Guard:
  - phải có `boardId`
  - board phải thuộc user
- Include tasks + labels.

### 2) `POST(req)`
- Vai trò: tạo column.
- Input: `name`, `boardId`, `color?`, `position?`.
- Nếu thiếu `position`, tự lấy `last.position + 1`.

### 3) `PUT(req)`
- Vai trò: update column theo `id`.
- Guard ownership.

### 4) `DELETE(req)`
- Vai trò: xóa column theo query `id`.
- Guard ownership.

---

## F) `/api/labels/route.ts`

### 1) `GET(req)`
- Vai trò: lấy labels theo `boardId`.
- Guard board ownership.

### 2) `POST(req)`
- Vai trò: tạo label.
- Validation: `labelValidationSchema`.
- Guard board ownership.

### 3) `PUT(req)`
- Vai trò: update label.
- Guard label ownership.

### 4) `DELETE(req)`
- Vai trò: delete label theo query `id`.
- Guard label ownership.

---

## G) `/api/comments/route.ts`

### Validation schema nội bộ
- `commentValidationSchema`: `content` (1..1000), `taskId` bắt buộc.

### 1) `GET(req)`
- Vai trò: list comments theo `taskId`.
- Guard task ownership.
- Sort: `createdAt desc`.

### 2) `POST(req)`
- Vai trò: tạo comment mới.
- Validation schema + guard ownership task.

### 3) `DELETE(req)`
- Vai trò: xóa comment theo query `id`.
- Guard comment ownership.

---

## H) `/api/activity-logs/route.ts`

### Validation schema nội bộ
- `activityLogValidationSchema`: `action`, `taskId`, optional `description`, `oldValue`, `newValue`.

### 1) `GET(req)`
- Vai trò: lấy activity logs của task.
- Guard task ownership.
- Limit: 50 bản ghi gần nhất.

### 2) `POST(req)`
- Vai trò: tạo activity log thủ công.
- Validation + ownership check.

---

## I) `/api/reminders/route.ts`

### 1) `GET(req)`
- Vai trò: lấy task có reminder trong 5 phút tới và `reminderSent = false`.
- Include: `board.name`, `column.name`.

### 2) `POST(req)`
- Vai trò: đánh dấu reminder đã gửi.
- Input: `{ taskId }`.
- Guard ownership task.
- Side effects: `task.reminderSent = true`.

Ghi chú: UI hiện tại có nơi gọi `/api/reminders/mark-sent`; route này không tồn tại trong code hiện tại.

---

## J) `/api/export/route.ts`

### 1) `GET(req)`
- Vai trò: export dữ liệu user.
- Trả về:
  - boards (kèm columns/tasks/labels/comments)
  - standaloneTasks
  - metadata `exportDate`, `version`

### 2) `POST(req)`
- Vai trò: import dữ liệu.
- Input hiện tại kỳ vọng object có `boards`, `standaloneTasks`.
- Luồng import:
  1. Tạo board.
  2. Tạo labels.
  3. Tạo columns.
  4. Tạo tasks.
  5. Tạo comments.
  6. Import standalone tasks.
- Output: thống kê `results` + errors.
- Edge case quan trọng:
  - Client `ExportImport.tsx` gửi payload `{ data, mode }`, khác shape route mong đợi (`{ boards, standaloneTasks }`). Cần đồng bộ để import hoạt động ổn định.

---

## K) `/api/health/route.ts`

### `GET(req)`
- Vai trò: health check auth + database.
- Luồng xử lý:
  1. đọc `userId`.
  2. test DB connection bằng `SELECT 1`.
  3. thử đếm board.
- Output: object chứa `status`, `timestamp`, `auth`, `database`.
- Dùng cho debug môi trường, không phải nghiệp vụ người dùng.

---

## L) Validation/Security patterns chung

- Ownership luôn check trước khi mutate dữ liệu.
- Input schema bằng Yup cho entities chính.
- Query params parse thủ công, cần kiểm tra kỹ khi mở rộng.
- Nhiều route có debug logs verbose; nên thay bằng logger có level khi production.

## M) Ví dụ request/response

### Tạo task

Request:
```http
POST /api/tasks
Content-Type: application/json
```

```json
{
  "title": "Fix drag bug",
  "description": "Delay dnd on touch",
  "date": "2026-03-03",
  "priority": "high",
  "boardId": "board_1",
  "columnId": "col_1",
  "labelIds": ["label_1"],
  "assigneeIds": ["danh"],
  "checklist": [{"text":"Reproduce bug","done":false}]
}
```

Response success:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "Fix drag bug"
  },
  "status": 201
}
```

### Lấy board chi tiết

Request:
```http
GET /api/boards/{id}
```

Response success:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Product Board",
    "columns": []
  },
  "status": 200
}
```
