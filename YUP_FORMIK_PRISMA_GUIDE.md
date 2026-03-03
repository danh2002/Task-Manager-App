# Yup, Formik & Prisma Integration Guide

## Cấu Trúc Dự Án

### 1. **Validation Layer** (`app/lib/validations/`)
- `taskSchema.ts` - Định nghĩa schema validation với Yup
- Type-safe validation schemas với TypeScript inference

### 2. **Prisma Configuration** (`app/lib/`)
- `prisma.ts` - Singleton Prisma client để tránh multiple instances
- Tự động kết nối database với caching

### 3. **API Response Handlers** (`app/lib/`)
- `api-response.ts` - Standardized response format cho tất cả API routes
- `successResponse()` và `errorResponse()` helpers

### 4. **Form Components** (`app/components/Forms/`)
- `CreateTaskForm.tsx` - Formik form component với validation
- `FormikForm.tsx` - Reusable form components library

### 5. **API Routes** (`app/api/`)
- `tasks/route.ts` - POST, GET, PUT endpoints với validation
- `tasks/[id]/route.ts` - DELETE và GET single task

## Cách Sử Dụng

### Tạo Form Mới với Formik + Yup

```tsx
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const MySchema = Yup.object().shape({
  name: Yup.string().required("Required"),
});

export default function MyForm() {
  return (
    <Formik
      initialValues={{ name: "" }}
      validationSchema={MySchema}
      onSubmit={async (values) => {
        // Dữ liệu đã được validate
        const response = await fetch("/api/your-endpoint", {
          method: "POST",
          body: JSON.stringify(values),
        });
      }}
    >
      <Form>
        <Field name="name" />
      </Form>
    </Formik>
  );
}
```

### Tạo API Route với Prisma + Validation

```typescript
import { auth } from "@clerk/nextjs";
import prisma from "@/app/lib/prisma";
import { mySchema } from "@/app/lib/validations/mySchema";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    let validatedData = await mySchema.validate(body);

    const data = await prisma.model.create({
      data: { ...validatedData, userId },
    });

    return successResponse(data, 201);
  } catch (error: any) {
    return errorResponse(error.message || "Error", 500);
  }
}
```

### Thêm Validation Schema Mới

```typescript
// app/lib/validations/userSchema.ts
import * as Yup from "yup";

export const userValidationSchema = Yup.object().shape({
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required(),
  name: Yup.string().required(),
});

export type UserFormValues = Yup.InferType<typeof userValidationSchema>;
```

## Best Practices

✅ **Luôn sử dụng validation schema** - Bảo vệ backend từ dữ liệu không hợp lệ
✅ **Type-safe values** - Sử dụng `Yup.InferType<>` cho TypeScript
✅ **Standardized responses** - Sử dụng `successResponse()` và `errorResponse()`
✅ **Verify userId** - Kiểm tra authorization ở mỗi API route
✅ **Singleton Prisma** - Tránh connection leaks bằng cách import từ `app/lib/prisma.ts`
✅ **Error handling** - Catch validation errors và database errors separately

## Troubleshooting

### Lỗi: "Cannot find module @/app/lib/prisma"
- Đảm bảo đã chạy `npm install && npx prisma generate`
- Kiểm tra `tsconfig.json` có paths configuration đúng

### Lỗi: "ValidationError: field is required"
- Kiểm tra form data matching schema
- Validate data trước khi submit

### Lỗi: "Unauthorized"
- Đảm bảo user đã login qua Clerk
- Kiểm tra middleware.ts configuration

## File Structure Summary

```
📁 app/lib/
  ├── prisma.ts                 // Singleton Prisma client
  ├── api-response.ts           // Response helpers
  └── validations/
      └── taskSchema.ts         // Task validation schema

📁 app/components/Forms/
  ├── CreateTaskForm.tsx        // Example form
  └── FormikForm.tsx            // Reusable form components

📁 app/api/tasks/
  ├── route.ts                  // POST, GET, PUT
  └── [id]/route.ts             // DELETE, GET single
```

## Kỳ Tiếp Theo

1. Tạo validation schemas cho các models khác
2. Tạo reusable form components cho từng entity
3. Thêm error boundaries cho form submissions
4. Implement optimistic updates
5. Thêm loading states và disabled states
