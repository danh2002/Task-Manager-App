# Quick Reference - Yup, Formik & Prisma Patterns

## 📋 Validation Patterns

### Basic Schema
```typescript
import * as Yup from "yup";

export const basicSchema = Yup.object().shape({
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required(),
});
```

### Custom Validation
```typescript
const customSchema = Yup.object().shape({
  username: Yup.string()
    .min(3)
    .test("no-spaces", "Username cannot contain spaces", (value) => {
      return !value || !value.includes(" ");
    })
    .required(),
});
```

### Conditional Fields
```typescript
const conditionalSchema = Yup.object().shape({
  type: Yup.string().required(),
  specialField: Yup.string().when("type", {
    is: "special",
    then: Yup.string().required(),
    otherwise: Yup.string(),
  }),
});
```

### Array Validation
```typescript
const arraySchema = Yup.object().shape({
  tags: Yup.array()
    .of(Yup.string().min(2))
    .min(1, "At least 1 tag required")
    .max(5, "Max 5 tags"),
});
```

### Async Validation
```typescript
const asyncSchema = Yup.object().shape({
  email: Yup.string()
    .email()
    .test("email-exists", "Email already taken", async (value) => {
      const exists = await checkEmailExists(value);
      return !exists;
    }),
});
```

---

## 🎨 Formik Patterns

### Basic Form
```tsx
<Formik
  initialValues={{ email: "", password: "" }}
  validationSchema={basicSchema}
  onSubmit={async (values) => {
    // submit logic
  }}
>
  {({ values, errors, touched, isSubmitting }) => (
    <Form>
      <Field name="email" />
      {touched.email && errors.email && <div>{errors.email}</div>}
    </Form>
  )}
</Formik>
```

### Form with Manual Field Management
```tsx
<Formik {...props}>
  {({ setFieldValue, values }) => (
    <Form>
      <Field
        name="date"
        onChange={(e) => {
          setFieldValue("date", e.target.value);
          // custom logic
        }}
      />
    </Form>
  )}
</Formik>
```

### Form Array with FieldArray
```tsx
<FieldArray name="items">
  {({ push, remove }) => (
    <div>
      {values.items.map((item, idx) => (
        <Field key={idx} name={`items.${idx}.name`} />
      ))}
      <button onClick={() => push({ name: "" })}>Add Item</button>
    </div>
  )}
</FieldArray>
```

### Auto-save Form
```tsx
<Formik
  initialValues={initial}
  onSubmit={() => {}} // no-op
>
  {({ values }) => (
    <Form>
      <Field
        name="title"
        onChange={(e) => {
          // auto-save on change
          saveToServer(values);
        }}
      />
    </Form>
  )}
</Formik>
```

---

## 🔌 Prisma Patterns

### Basic CRUD
```typescript
// Create
const task = await prisma.task.create({
  data: { title, description, userId },
});

// Read
const task = await prisma.task.findUnique({
  where: { id },
});

// Read Many
const tasks = await prisma.task.findMany({
  where: { userId },
  orderBy: { createdAt: "desc" },
  take: 10,
  skip: 0,
});

// Update
const task = await prisma.task.update({
  where: { id },
  data: { title },
});

// Delete
await prisma.task.delete({
  where: { id },
});
```

### Advanced Queries
```typescript
// With Relations
const user = await prisma.user.findUnique({
  where: { id },
  include: { tasks: true },
});

// With Filtering
const tasks = await prisma.task.findMany({
  where: {
    userId,
    isCompleted: false,
    OR: [
      { title: { contains: "urgent" } },
      { isImportant: true },
    ],
  },
});

// With Aggregation
const count = await prisma.task.count({
  where: { userId, isCompleted: true },
});

// With Transaction
const [task, user] = await prisma.$transaction([
  prisma.task.create({ data }),
  prisma.user.update({ where, data }),
]);
```

---

## 🌐 API Route Patterns

### Simple POST with Validation
```typescript
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const validated = await schema.validate(body);

    const item = await prisma.model.create({ data: validated });
    return successResponse(item, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
```

### GET with Query Parameters
```typescript
export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");

  const items = await prisma.model.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });

  return successResponse(items);
}
```

### PUT with Authorization Check
```typescript
export async function PUT(req: Request) {
  const { userId } = auth();
  if (!userId) return errorResponse("Unauthorized", 401);

  const { id, ...updates } = await req.json();

  // Verify ownership
  const existing = await prisma.model.findUnique({ where: { id } });
  if (existing?.userId !== userId) {
    return errorResponse("Forbidden", 403);
  }

  const updated = await prisma.model.update({
    where: { id },
    data: updates,
  });

  return successResponse(updated);
}
```

### DELETE with Validation
```typescript
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) return errorResponse("Unauthorized", 401);

  const item = await prisma.model.findUnique({
    where: { id: params.id },
  });

  if (!item || item.userId !== userId) {
    return errorResponse("Not found", 404);
  }

  await prisma.model.delete({ where: { id: params.id } });

  return successResponse({ message: "Deleted" });
}
```

---

## 🎯 Component Patterns

### Reusable Form Wrapper
```tsx
interface FormProps<T> {
  initialValues: T;
  schema: Yup.ObjectSchema<any>;
  onSubmit: (values: T) => Promise<void>;
  children: (formik: FormikProps<T>) => React.ReactNode;
}

export function FormWrapper<T>({
  initialValues,
  schema,
  onSubmit,
  children,
}: FormProps<T>) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={onSubmit}
    >
      {(formik) => <Form>{children(formik)}</Form>}
    </Formik>
  );
}
```

### Custom Hook for API Calls
```typescript
function useApiCall<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (data?: any) => {
    setLoading(true);
    try {
      const res = await fetch(url, {
        method,
        body: data ? JSON.stringify(data) : undefined,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result.data as T;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}
```

---

## 📝 Error Handling Patterns

### Try-Catch with Specific Errors
```typescript
try {
  // logic
} catch (error: any) {
  if (error.code === "P2002") {
    // Unique constraint violation
    return errorResponse("This already exists", 409);
  }
  if (error.code === "P2025") {
    // Record not found
    return errorResponse("Not found", 404);
  }
  return errorResponse("Server error", 500);
}
```

### Validation Error Handling
```typescript
try {
  await schema.validate(data, { abortEarly: false });
} catch (error: any) {
  const messages = error.errors.join(", ");
  return errorResponse(messages, 400);
}
```

---

## 🚀 Performance Patterns

### Memoization with useMemo
```tsx
const memoizedSchema = useMemo(() => 
  createSchema(props.type), 
  [props.type]
);
```

### Debounced Validation
```typescript
const debouncedValidate = debounce(async (value) => {
  const exists = await checkExists(value);
  if (exists) {
    // set error
  }
}, 500);
```

### Query Caching
```typescript
const getCachedTasks = async (userId: string) => {
  const cached = cache.get(userId);
  if (cached) return cached;

  const tasks = await prisma.task.findMany({ where: { userId } });
  cache.set(userId, tasks);
  return tasks;
};
```

---

**Bookmark this file untuk quick reference! 🚀**
