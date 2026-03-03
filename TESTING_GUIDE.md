# 🧪 Step-by-Step Testing Guide - Yup, Formik & Prisma

## Phase 1️⃣: Test Yup Validation

### Step 1.1: Test Yup Schema Directly

Tạo file tạm: `test-yup.js` trong root folder

```javascript
const Yup = require("yup");

// Import schema
const schema = require("./app/lib/validations/taskSchema.ts");

// Test 1: Valid data
const validData = {
  title: "My Task",
  description: "This is a task",
  date: "2026-03-01",
  isImportant: false,
  isCompleted: false,
};

schema.taskValidationSchema
  .validate(validData)
  .then((result) => console.log("✅ Valid:", result))
  .catch((err) => console.log("❌ Error:", err.message));

// Test 2: Invalid data (missing title)
const invalidData = {
  title: "",
  description: "",
  date: "",
};

schema.taskValidationSchema
  .validate(invalidData)
  .then(() => console.log("✅ Valid"))
  .catch((err) => console.log("❌ Expected Error:", err.errors));
```

Hoặc test trực tiếp trong browser console (F12):

```javascript
// Paste vào console:
const testData = {
  title: "",
  description: "test",
  date: "2026-03-01"
};

fetch("/api/tasks", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(testData),
})
  .then(r => r.json())
  .then(d => console.log("Response:", d));
```

### Step 1.2: Expected Results

✅ **Valid data**: Không có error
❌ **Missing title**: `"Title is required"`
❌ **Title < 3 chars**: `"Title must be at least 3 characters"`
❌ **Invalid date**: `"Please enter a valid date"`

---

## Phase 2️⃣: Test Formik Form

### Step 2.1: Open Form Modal

1. Mở app: http://localhost:3000
2. **Login** với Clerk
3. Click **"Create Task"** button (nút + ở left sidebar)
4. Modal form xuất hiện

### Step 2.2: Test Form Validation

**Test Case 1: Empty Form**
```
Action: Click "Create Task" button (form trống)
Expected: 
  ✅ Title error: "Title is required"
  ✅ Description error: "Description is required"
  ✅ Date error: "Date is required"
  ✅ Form không submit
```

**Test Case 2: Short Title**
```
Action:
  - Title: "AB" (2 chars)
  - Description: "test description"
  - Date: Select date
  - Click Create

Expected:
  ✅ Title error: "Title must be at least 3 characters"
  ❌ Form không submit
```

**Test Case 3: Valid Data**
```
Action:
  - Title: "My New Task"
  - Description: "This is a test task"
  - Date: Select any date
  - isImportant: Check/uncheck
  - Click "Create Task"

Expected:
  ✅ No error messages
  ✅ Form submits
  ✅ Toast: "Task created successfully"
  ✅ Modal closes
  ✅ New task appears in list
```

### Step 2.3: Test Form State

Mở **F12 → React DevTools** (nếu cài):

```
Check:
  - values: Formik state values
  - errors: Validation errors
  - touched: Fields được touch
  - isSubmitting: Trạng thái submit
```

---

## Phase 3️⃣: Test Prisma Database

### Step 3.1: Test Database Connection

```bash
# Terminal - Check Prisma status
npx prisma db seed

# Hoặc check schema
npx prisma generate
```

### Step 3.2: View Data in Prisma Studio

```bash
# Terminal
npx prisma studio

# Sẽ mở http://localhost:5555
# Xem tasks được tạo
```

### Step 3.3: Manual Database Check

Mở **MongoDB Compass** hoặc **MongoDB Atlas**:

1. Connect tới database (from .env.local)
2. Navigate to: `task-manager-app` → `Task`
3. Xem tasks được insert:

```json
{
  "_id": "...",
  "title": "My New Task",
  "description": "This is a test task",
  "date": "2026-03-01",
  "isCompleted": false,
  "isImportant": false,
  "userId": "user_xxx",
  "created_at": "2026-02-26T...",
  "updated_at": "2026-02-26T..."
}
```

---

## Phase 4️⃣: Test API Routes

### Step 4.1: Test POST /api/tasks (Create)

**Browser Console:**
```javascript
// Valid request
const data = {
  title: "API Test Task",
  description: "Created via API",
  date: "2026-03-15",
  isImportant: true,
  isCompleted: false
};

fetch("/api/tasks", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
})
  .then(r => r.json())
  .then(d => console.log("Result:", d));
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "API Test Task",
    "description": "Created via API",
    "date": "2026-03-15",
    "isImportant": true,
    "isCompleted": false,
    "userId": "user_xxx",
    "createdAt": "2026-02-26T...",
    "updatedAt": "2026-02-26T..."
  },
  "status": 201
}
```

### Step 4.2: Test GET /api/tasks (Fetch All)

```javascript
fetch("/api/tasks", {
  method: "GET",
})
  .then(r => r.json())
  .then(d => console.log("Tasks:", d));
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Task 1",
      "description": "...",
      // ...
    },
    {
      "id": "...",
      "title": "Task 2",
      // ...
    }
  ],
  "status": 200
}
```

### Step 4.3: Test PUT /api/tasks (Update)

```javascript
// Get a task ID from GET response first
const taskId = "..."; // from GET response

const updateData = {
  id: taskId,
  isCompleted: true,
  title: "Updated Task Title"
};

fetch("/api/tasks", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(updateData),
})
  .then(r => r.json())
  .then(d => console.log("Updated:", d));
```

### Step 4.4: Test DELETE /api/tasks/[id] (Delete)

```javascript
const taskId = "..."; // from GET response

fetch(`/api/tasks/${taskId}`, {
  method: "DELETE",
})
  .then(r => r.json())
  .then(d => console.log("Deleted:", d));
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Task deleted successfully"
  },
  "status": 200
}
```

---

## Phase 5️⃣: Test Error Handling

### Step 5.1: Test Validation Errors

**Without Authentication:**
```javascript
// Should fail - not logged in
fetch("/api/tasks", {
  method: "GET",
})
  .then(r => r.json())
  .then(d => console.log("Response:", d));
```

**Expected:**
```json
{
  "success": false,
  "error": "Unauthorized",
  "status": 401
}
```

### Step 5.2: Test Invalid Data

```javascript
const invalidData = {
  title: "X", // Too short
  description: "test",
  date: "invalid-date"
};

fetch("/api/tasks", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(invalidData),
})
  .then(r => r.json())
  .then(d => console.log("Error:", d));
```

**Expected:**
```json
{
  "success": false,
  "error": "Validation Error: Title must be at least 3 characters, Please enter a valid date",
  "status": 400
}
```

### Step 5.3: Test Not Found Error

```javascript
const fakeId = "fake_id_12345";

fetch(`/api/tasks/${fakeId}`, {
  method: "DELETE",
})
  .then(r => r.json())
  .then(d => console.log("Response:", d));
```

**Expected:**
```json
{
  "success": false,
  "error": "Task not found or unauthorized",
  "status": 404
}
```

---

## Phase 6️⃣: Test Complete Workflow

### Workflow Test Checklist

```
1. ✅ Open app và login
2. ✅ Create new task via form
   - Fill valid data
   - Submit
   - See success toast
   - Modal closes
   - Task appears in list
   
3. ✅ Check database
   - Open Prisma Studio
   - Task exists trong DB
   - Fields correct
   
4. ✅ Update task
   - Click task
   - Mark as complete
   - Update success
   - See updated state
   
5. ✅ Delete task
   - Click delete button
   - Confirm delete
   - Task removed from list
   - Task removed from DB
   
6. ✅ Test validation errors
   - Try submit empty form
   - See error messages
   - Form không submit
   
7. ✅ Test API directly
   - Test POST via console
   - Test GET via console
   - Test PUT via console
   - Test DELETE via console
```

---

## 🐛 Troubleshooting

### Problem: Form không validate
```
Solution:
1. Check browser console (F12) cho errors
2. Verify taskSchema.ts có export đúng
3. Reload page (Ctrl+Shift+R hard refresh)
```

### Problem: Task không save vào DB
```
Solution:
1. Check .env.local có DATABASE_URL
2. Check MongoDB connection string đúng
3. Run: npx prisma db push
4. Check Prisma Studio (npx prisma studio)
```

### Problem: API trả về error 401 Unauthorized
```
Solution:
1. Đảm bảo đã login với Clerk
2. Check middleware.ts đúng
3. Check .env.local có Clerk keys
```

### Problem: Validation errors không hiển thị
```
Solution:
1. Check Formik component (CreateTaskForm.tsx)
2. Verify ErrorMessage component render
3. Check styled-components định nghĩa đúng
```

---

## 📊 Test Results Summary

Create file `TEST_RESULTS.md` và record kết quả:

```
## Test Results - [Date]

### Yup Validation
- [ ] Valid data passes
- [ ] Missing title fails
- [ ] Short title fails
- [ ] Invalid date fails
Status: ✅ PASS / ❌ FAIL

### Formik Form
- [ ] Form renders
- [ ] Validation shows on blur
- [ ] Errors clear on input
- [ ] Submit button disabled on error
Status: ✅ PASS / ❌ FAIL

### Prisma Database
- [ ] Task created in DB
- [ ] All fields present
- [ ] userId saved correctly
- [ ] Timestamps added
Status: ✅ PASS / ❌ FAIL

### API Routes
- [ ] POST creates task
- [ ] GET returns tasks
- [ ] PUT updates task
- [ ] DELETE removes task
Status: ✅ PASS / ❌ FAIL

### Error Handling
- [ ] Validation errors caught
- [ ] Authorization checked
- [ ] Not found errors returned
- [ ] Error messages clear
Status: ✅ PASS / ❌ FAIL

### Overall
- [ ] Complete workflow works
Status: ✅ PASS / ❌ FAIL
```

---

## ✅ Success Criteria

Project setup thành công khi:

1. ✅ Form renders mà không errors
2. ✅ Validation works (client + server)
3. ✅ Data saves vào Prisma/MongoDB
4. ✅ API returns standardized responses
5. ✅ Error handling works
6. ✅ Complete CRUD operations work
7. ✅ Database queries correct
8. ✅ Authorization checks work

---

**Good luck testing! 🚀**
