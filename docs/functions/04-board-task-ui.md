# 04 - Board/Task UI Functions

## A) `BoardList` module (`app/components/Board/BoardList.tsx`)

### 1) `BoardList`
- Vai trò: hiển thị tất cả boards + modal tạo board + xác nhận xóa board.
- Trigger: route `/`.
- Input: đọc `boards` và actions từ global context.
- Output: grid card board.
- Luồng xử lý:
  1. `useEffect` gọi `allBoards()` khi mount.
  2. Render empty state nếu list rỗng.
  3. Click card điều hướng vào board detail.

### 2) `handleBoardClick(boardId)`
- Vai trò: chọn board và `router.push(/board/:id)`.

### 3) `handleDeleteBoardClick(e, boardId, boardName)`
- Vai trò: mở modal confirm xóa, chặn click lan lên card.

### 4) `handleConfirmDeleteBoard()`
- Vai trò: gọi `deleteBoard(id)`, đóng confirm, reset state cục bộ.

### 5) `handleCreateBoard()`
- Vai trò: mở modal tạo board (`openModal`).

## B) `BoardView` module (`app/components/Board/BoardView.tsx`)

### 1) `hexToRgba(hex, alpha)`
- Vai trò: convert mã hex sang rgba để tô count badge.

### 2) `getColumnColor(column)`
- Vai trò: ưu tiên màu cột; fallback theo tên cột (`done/progress/todo`).

### 3) `BoardView({ boardId })`
- Vai trò: trang board detail gồm columns + tasks + dnd + modals.
- Luồng xử lý chính:
  1. load board bằng `getBoard(boardId)`.
  2. load task theo từng column qua `/api/tasks?columnId=...`.
  3. render 3 modal flow: create column, create task, edit task.
  4. setup dnd sensors và handlers.

### 4) `isDoneColumn(columnName)`
- Vai trò: nhận diện cột hoàn thành.

### 5) `handleAddTask(columnId)`
- Vai trò: mở modal tạo task tại cột được chọn.

### 6) `handleTaskCreated()`
- Vai trò: đóng modal task và reload board.

### 7) `handleTaskDeleted(deletedTaskId)`
- Vai trò: remove task khỏi `columnTasks` local để UI phản hồi nhanh.

### 8) `handleDragStart(event)`
- Vai trò: xác định task đang kéo để render `DragOverlay`.

### 9) `handleDragEnd(event)`
- Vai trò: xử lý reorder trong cùng cột hoặc move qua cột khác.
- Luồng chi tiết:
  1. lấy `active` và `over`.
  2. tìm `sourceColumnId`, `targetColumnId`, task object.
  3. nếu cùng cột -> `arrayMove` theo vị trí mới.
  4. nếu khác cột -> update local state source/target.
  5. xác định `isCompleted` mới theo logic cột Done.
  6. gọi `PUT /api/tasks/:id` để persist.
  7. nếu lỗi -> rollback bằng `getBoard(boardId)`.
- Validation & guard:
  - skip khi không có `over`.
  - skip khi không xác định được source/target/task.
- Side effects: toast success/error.
- Edge cases:
  - drop vào cột rỗng dùng id cột.
  - drop lên task cụ thể dùng id task.
- Ghi chú delay drag:
  - `PointerSensor` dùng `activationConstraint: { delay: 20, tolerance: 6 }`.

### 10) `handleDeleteColumnClick(columnId, columnName)`
- Vai trò: mở modal confirm xóa cột.

### 11) `handleConfirmDeleteColumn()`
- Vai trò: gọi `deleteColumn`, đóng modal.

### 12) `DroppableColumn`
- Vai trò: wrapper nhận drop target bằng `useDroppable`.
- Output: `ColumnShell` highlight khi `isOver = true`.

## C) `SortableTask` (`app/components/TaskItem/SortableTask.tsx`)

### 1) `SortableTask(props)`
- Vai trò: nối `TaskItem` với `useSortable`.
- Input: task props.
- Output: task card có draggable listeners + transform/transition style.
- Luồng xử lý:
  1. gọi `useSortable({ id })`.
  2. apply `attributes/listeners` vào wrapper.
  3. render `TaskItem`.
- Side effects: không, chỉ interaction dnd.

## D) `TaskItem` (`app/components/TaskItem/TaskItem.tsx`)

### 1) `TaskItem(props)`
- Vai trò: hiển thị card task và mở edit modal khi click.
- Luồng xử lý:
  1. normalize priority.
  2. parse checklist + assignees.
  3. dựng avatar list + progress text.
  4. click card -> `handleOpenEdit`.

### 2) `handleOpenEdit()`
- Vai trò: đẩy payload task vào `setEditingTask` để mở form edit.

### 3) `normalizePriority(p)`
- Vai trò: chuẩn hóa priority về `low|medium|high`, fallback `medium`.

### 4) `parseChecklist(value)`
- Vai trò: parse checklist từ array hoặc JSON string.

### 5) `parseAssigneeIds(value)`
- Vai trò: parse assignee ids và unique.

### 6) `hexToRgba(hex, alpha)`
- Vai trò: tạo màu nền badge label.

### 7) `capitalize(s)`
- Vai trò: viết hoa chữ cái đầu.

### 8) `getTag(priority)`
- Vai trò: trả label mặc định theo priority khi task không có custom labels.

### 9) `priorityColor(priority)`
- Vai trò: map priority -> màu hiển thị.

## E) `Tasks` list (`app/components/Tasks/Tasks.tsx`)

### 1) `Tasks({ title, tasks })`
- Vai trò: view generic cho list tasks (important/completed/incomplete).
- Luồng xử lý:
  1. sync `localTasks` từ props.
  2. nếu có search result thì ưu tiên hiển thị search result.
  3. render task cards + nút create.

### 2) `handleSearchResults(results)`
- Vai trò: cập nhật list hiển thị theo search.

### 3) `handleTaskUpdate()`
- Vai trò: refresh tasks qua `allTasks()`.

### 4) `handleTaskDeleted(deletedTaskId)`
- Vai trò: remove task khỏi local list tức thì.

## F) `SearchFilter` (`app/components/Search/SearchFilter.tsx`)

### 1) `SearchFilter({ boardId, onTagsChanged })`
- Vai trò: UI search/filter + quản lý tags.
- Ghi chú: input search hiện mới UI, chưa có query binding thực tế.

### 2) `fetchLabels()`
- Vai trò: load labels theo board.

### 3) `onClickOutside(event)` (trong `useEffect`)
- Vai trò: click ngoài popover thì đóng popover tags.

### 4) `handleCreateTag()`
- Vai trò: tạo label mới qua `POST /api/labels`.

### 5) `handleStartEdit(label)`
- Vai trò: vào trạng thái sửa tag.

### 6) `handleCancelEdit()`
- Vai trò: thoát trạng thái sửa tag.

### 7) `handleUpdateTag()`
- Vai trò: cập nhật label qua `PUT /api/labels`.

### 8) `handleDeleteTag(id)`
- Vai trò: xóa label qua `DELETE /api/labels?id=`.

## G) Forms

### `BoardForm` (`app/components/Forms/BoardForm.tsx`)

#### 1) `BoardForm({ onSuccess })`
- Vai trò: form tạo board với Formik + Yup.

#### 2) `handleSubmit(values, formikHelpers)`
- Vai trò: gọi `createBoard`, đóng modal, reset form, callback `onSuccess`.

### `ColumnForm` (`app/components/Forms/ColumnForm.tsx`)

#### 1) `ColumnForm({ boardId, onSuccess, initialValues, isEdit })`
- Vai trò: form tạo/sửa cột.

#### 2) `handleSubmit(values, formikHelpers)`
- Vai trò: nhánh create (`createColumn`) hoặc update (`updateColumn`) theo `isEdit`.

### `CreateTaskForm` (`app/components/Forms/CreateTaskForm.tsx`)

#### 1) `formatDateForInput(dateValue)`
- Vai trò: convert date về `YYYY-MM-DD` cho input date.

#### 2) `formatDateTimeForInput(dateValue)`
- Vai trò: convert date về `YYYY-MM-DDTHH:mm` cho input datetime-local.

#### 3) `todayString()`
- Vai trò: lấy ngày hôm nay dạng string chuẩn input.

#### 4) `parseChecklist(value)`
- Vai trò: parse checklist từ edit payload.

#### 5) `parseLabelIds(editingTask)`
- Vai trò: lấy `labelIds` từ nhiều shape dữ liệu edit.

#### 6) `parseAssigneeIds(editingTask)`
- Vai trò: parse assigneeIds array/string.

#### 7) `CreateTaskForm(props)`
- Vai trò: form tạo/sửa task hợp nhất.
- Luồng chính:
  1. dựng initial values từ edit/new.
  2. fetch labels theo board hiện hành.
  3. submit gọi API create hoặc update.
  4. refresh `allTasks()`, đóng modal, callback success.

#### 8) `fetchLabels()` (nội bộ `useEffect`)
- Vai trò: tải labels để chọn tags.

#### 9) `handleCancel()`
- Vai trò: ưu tiên callback `onCancel`, nếu không thì `closeModal`.

#### 10) `handleSubmit(values, helpers)`
- Vai trò: submit task create/update + toast kết quả.

### `EditTaskForm` (`app/components/Forms/EditTaskForm.tsx`)

#### 1) `EditTaskForm({ task })`
- Vai trò: form edit legacy dùng Formik.

#### 2) `handleSubmit(values, helpers)`
- Vai trò: tạo payload update và gọi `PUT /api/tasks`.

### `FormikForm` examples (`app/components/Forms/FormikForm.tsx`)

#### 1) `BasicFormExample`
- Vai trò: ví dụ pattern form cơ bản.

#### 2) `handleSubmit` (trong `CustomFormExample`)
- Vai trò: minh họa custom async submit.

#### 3) `ArrayFormExample`
- Vai trò: minh họa mảng field trong Formik.

## H) Modals/Button

### `Modal` (`app/components/Modals/Modal.tsx`)

#### 1) `Modal({ content })`
- Vai trò: khung modal dùng lại.
- Luồng: click overlay đóng modal, click card chặn bubbling.

### `CreateContent` (`app/components/Modals/CreateContent.tsx`)

#### 1) `CreateContent()`
- Vai trò: chọn render `CreateTaskForm` ở mode edit hoặc create theo `editingTask`.

### `Button` (`app/components/Button/Button.tsx`)

#### 1) `Button(props)`
- Vai trò: button reusable theo theme + inline overrides.
- Guard: nếu `disabled` thì bỏ `onClick`.

## I) Sidebar (`app/components/Sidebar/Sidebar.tsx`)

### 1) `Sidebar()`
- Vai trò: thanh điều hướng cạnh trái khi user đã đăng nhập.
- Input: đọc `selectedtheme`, `theme`, `toggleTheme` từ global context; dùng router + pathname để xác định active nav.
- Output: icon nav trên, icon tiện ích dưới (theme toggle + sign out).
- Luồng xử lý:
  1. khai báo danh sách nav items.
  2. render active state theo `pathname`.
  3. click theme icon -> `toggleTheme()`.
  4. click sign-out -> `signOut(() => router.push('/signin'))`.
- Validation & guard:
  - nav item không có `link` thì click không điều hướng.
- Side effects:
  - thay đổi localStorage theme (gián tiếp qua provider).
  - kết thúc session Clerk khi sign out.

## J) Validation & lỗi thường gặp

- Form submit không chạy: kiểm tra schema Yup và field name khớp payload API.
- Task không vào đúng cột: kiểm tra `columnId` gửi lên trong form.
- DnD không trigger: kiểm tra sensor delay/tolerance và listeners gắn đúng wrapper.

## K) Ví dụ user flow

1. User vào board -> `BoardView` tải columns/tasks.
2. Click `Add Task` -> mở `CreateTaskForm`.
3. Submit -> API `/api/tasks`.
4. Task render trong cột.
5. Drag task sang Done -> `handleDragEnd` cập nhật `isCompleted` + persist API.
