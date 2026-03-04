# 05 - Reminder, Comments, Export/Import Functions

## A) Reminder Notification (`app/components/Reminders/ReminderNotification.tsx`)

### 1) `playReminderSound()`
- Vai trò: phát âm báo khi có reminder.
- Luồng xử lý:
  1. thử phát file `/notification-sound.mp3`.
  2. nếu fail (autoplay policy, missing file...) thì fallback Web Audio API beep.
- Side effects: tạo `Audio` hoặc `AudioContext`.

### 2) `requestNotificationPermission()`
- Vai trò: xin quyền desktop notification nếu trạng thái là `default`.
- Guard: chỉ chạy nếu browser hỗ trợ `Notification`.

### 3) `showDesktopNotification(title, body)`
- Vai trò: hiển thị thông báo hệ điều hành.
- Guard: chỉ chạy khi `Notification.permission === 'granted'`.

### 4) `ReminderNotification()`
- Vai trò: component poll nhắc việc theo chu kỳ.
- State chính:
  - `reminders`: danh sách reminder đã trigger tại client
  - `showNotification`: mở/đóng panel reminder
  - `processedReminders` (ref): tránh bắn lặp cùng task
- Luồng xử lý:
  1. mount: đăng ký init audio context theo user interaction đầu tiên.
  2. mount: xin quyền notification.
  3. poll `checkReminders` ngay lập tức và mỗi 5 giây.
  4. nếu có reminder mới trong cửa sổ thời gian [-5s, +5s]:
     - đánh dấu processed
     - append state
     - phát âm thanh
     - show desktop notification
     - show toast
     - gọi API đánh dấu reminder sent
- Edge cases:
  - endpoint mark sent đang gọi `/api/reminders/mark-sent` (không khớp route server hiện tại).
  - browser chặn audio/notification.

### 5) `initAudio()` (nội bộ useEffect)
- Vai trò: tạo audio context sau tương tác user để vượt autoplay restrictions.

### 6) `checkReminders()` (nội bộ `useCallback`)
- Vai trò: engine kiểm tra và trigger reminder.

## B) Comments (`app/components/Comments/*`)

### `CommentsSection.tsx`

#### 1) `CommentsSection({ taskId, isOpen, onToggle })`
- Vai trò: wrapper logic comments cho từng task.
- Luồng:
  1. khi `isOpen` true -> fetch comments.
  2. render `CommentForm` + `CommentList`.

#### 2) `fetchComments()`
- Vai trò: `GET /api/comments?taskId=...` và set list comments.
- Guard: nếu panel đóng thì không fetch.

#### 3) `handleDelete(commentId)`
- Vai trò: xóa comment qua API và refresh list.

### `CommentForm.tsx`

#### 1) `CommentForm({ taskId, onCommentAdded })`
- Vai trò: form nhập comment mới.

#### 2) `handleSubmit(e)`
- Vai trò: validate client-side + gọi `POST /api/comments`.
- Validation:
  - không rỗng
  - <= 1000 ký tự
- Side effects: toast + reset textarea + callback refresh.

### `CommentList.tsx`

#### 1) `formatTimeAgo(dateString)`
- Vai trò: formatter relative time thủ công (`just now`, `5m ago`...).

#### 2) `CommentList({ comments, currentUserId, onDelete })`
- Vai trò: render list comments + nút delete cho chính chủ.
- Guard: empty list -> empty state.

## C) Export / Import (`app/components/ExportImport/ExportImport.tsx`)

### 1) `ExportImport({ isOpen, onClose })`
- Vai trò: UI cấu hình và thao tác export/import dữ liệu.
- State chính:
  - `isExporting`, `isImporting`
  - `exportFormat` (`json|csv`)
  - `exportType` (`all|tasks|boards`)
  - `importMode` (`merge|replace`)

### 2) `handleExport()`
- Vai trò: xuất dữ liệu và tải file.
- Luồng:
  1. gọi `GET /api/export?format=...&type=...`.
  2. nếu CSV -> tạo blob và download `.csv`.
  3. nếu JSON -> stringify và download `.json`.
- Edge cases:
  - server hiện tại chưa xử lý `format/type`; luôn trả JSON object chuẩn export.

### 3) `handleImport(event)`
- Vai trò: đọc file JSON/CSV từ client rồi gửi import API.
- Luồng:
  1. đọc file text.
  2. parse JSON hoặc map CSV -> object.
  3. `POST /api/export` với payload `{ data, mode }`.
  4. success -> toast + reload page.
- Edge cases:
  - server `POST /api/export` hiện kỳ vọng payload trực tiếp `{ boards, standaloneTasks }`, không phải `{ data, mode }`.

## D) API route liên quan comments/reminders/export

### 1) `/api/comments`
- `GET`: list comments theo task.
- `POST`: tạo comment (validation + ownership).
- `DELETE`: xóa comment (ownership).

### 2) `/api/reminders`
- `GET`: lấy reminders upcoming 5 phút.
- `POST`: mark reminder sent theo `taskId`.

### 3) `/api/export`
- `GET`: export all data.
- `POST`: import dữ liệu boards/tasks/comments.

## E) Lỗi thường gặp + cách debug

- Reminder bắn lặp:
  - kiểm tra endpoint mark-sent mismatch.
  - kiểm tra cờ `reminderSent` trong DB.
- Import không hoạt động:
  - so payload client/server của `/api/export`.
- Comment không hiện ngay:
  - xác nhận `onCommentAdded()` gọi lại `fetchComments()`.

## F) Ví dụ flow reminder

1. User tạo task có `reminder`.
2. Đến thời điểm gần reminder, `checkReminders()` bắt được task.
3. Component phát âm báo + desktop notification + toast.
4. Client gọi API mark sent.
5. Task không còn xuất hiện ở lượt poll sau (nếu endpoint đúng).
