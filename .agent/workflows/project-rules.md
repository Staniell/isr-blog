---
description: Architectural rules and constraints for the ISR Blog project
---

# ISR Blog Project Rules

## Architecture Rules

### 1. Runtime Enforcement

Every page that uses Prisma MUST explicitly declare:

```typescript
export const runtime = "nodejs";
```

**Rationale:** Prisma cannot run in Edge runtime. Explicit declaration prevents accidental Edge deployment.

---

### 2. Static Generation Strategy

#### Pages That MUST Be Statically Generated

| Route          | Strategy  | Revalidation           |
| -------------- | --------- | ---------------------- |
| `/blog`        | SSG + ISR | Time-based + On-demand |
| `/blog/[slug]` | SSG + ISR | Time-based + On-demand |

#### Implementation Pattern

```typescript
// For dynamic routes
export async function generateStaticParams() {
  const items = await getItems();
  return items.map((item) => ({ slug: item.slug }));
}

// For ISR
export const revalidate = 3600; // Revalidate every hour
```

---

### 3. Data Fetching Rules

#### ✅ ALLOWED

| Context              | Prisma Queries |
| -------------------- | -------------- |
| Server Components    | ✅ Yes         |
| Server Actions       | ✅ Yes         |
| API Routes (Node.js) | ✅ Yes         |
| Build Time           | ✅ Yes         |
| ISR Revalidation     | ✅ Yes         |

#### ❌ FORBIDDEN

| Context           | Prisma Queries |
| ----------------- | -------------- |
| Client Components | ❌ NEVER       |
| Edge Runtime      | ❌ NEVER       |
| Client-side fetch | ❌ NEVER       |

---

### 4. Server Actions Rules

All mutations MUST be Server Actions:

```typescript
"use server";

export async function myAction(formData: FormData) {
  // 1. Authenticate
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  // 2. Validate input
  // 3. Perform mutation
  // 4. Trigger revalidation
  revalidateTag("my-tag");
  revalidatePath("/my-path");
}
```

**Requirements:**

- Must start with `"use server"` directive
- Must authenticate before mutations
- Must trigger ISR revalidation after success
- Must never expose secrets to client

---

### 5. ISR Revalidation Rules

#### Time-Based Revalidation

```typescript
export const revalidate = 3600; // Seconds
```

#### On-Demand Revalidation

After mutations, revalidate:

```typescript
import { revalidatePath, revalidateTag } from "next/cache";

// Revalidate specific paths
revalidatePath("/blog");
revalidatePath(`/blog/${slug}`);

// Or use tags for granular control
revalidateTag("blog-list");
revalidateTag(`blog-post-${slug}`);
```

**Rule:** Always revalidate BOTH the list page AND the individual post page.

---

### 6. CDN Image Rules

#### Database Storage

```typescript
// ✅ CORRECT - Store relative path
await prisma.post.create({
  data: {
    coverImage: "abc123.webp", // Relative only
  },
});

// ❌ WRONG - Never store full URL
await prisma.post.create({
  data: {
    coverImage: "https://b.catgirlsare.sexy/abc123.webp",
  },
});
```

#### Image Rendering

```typescript
// Always use getImageUrl() when rendering
<img src={getImageUrl(post.coverImage)} alt={post.title} />
```

#### Before Saving

```typescript
// Always strip CDN base URL before saving
const relativePath = stripCdnBaseUrl(fullUrl);
await prisma.post.update({
  data: { coverImage: relativePath },
});
```

---

### 7. Theming Rules

#### CSS Variables

Define all theme values as CSS custom properties:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #111827;
}

[data-theme="dark"] {
  --bg-primary: #111827;
  --text-primary: #f9fafb;
}
```

#### Application

Apply themes via data attribute:

```typescript
document.documentElement.setAttribute("data-theme", theme);
```

#### Persistence

Use localStorage (client-side only):

```typescript
localStorage.setItem("theme", theme);
```

#### Flash Prevention

Add inline script in layout BEFORE body content:

```typescript
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        const theme = localStorage.getItem('theme');
        if (theme) {
          document.documentElement.setAttribute('data-theme', theme);
        }
      })();
    `,
  }}
/>
```

#### Theme Consistency for Custom UI

All custom UI components (especially Modals, Dialogs, and Popovers) MUST explicitly use theme CSS variables to ensure consistency across the 4-theme system.

**Requirements:**

- **Dialog Content**: Must use `bg-[var(--bg-primary)]`, `border-[var(--bg-secondary)]`, and `text-[var(--text-primary)]`.
- **Labels**: Must use `text-[var(--text-primary)]`.
- **Inputs/Textareas**: Must use `bg-[var(--bg-secondary)]`, `border-transparent`, `text-[var(--text-primary)]`, and `placeholder:text-[var(--text-secondary)]`.
- **Buttons (Ghost)**: Must explicitly set `text-[var(--text-primary)]` and `hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]` for consistent visibility.
- **Buttons (Action)**: High-priority actions should use `bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white`.

**Example Pattern:**

```tsx
<DialogContent className="bg-[var(--bg-primary)] border-[var(--bg-secondary)] text-[var(--text-primary)]">
  <Label className="text-[var(--text-primary)]">Title</Label>
  <Input className="bg-[var(--bg-secondary)] border-transparent text-[var(--text-primary)]" />
</DialogContent>
```

---

### 8. shadcn/ui Rules

#### Installation

```bash
npx shadcn@latest init
npx shadcn@latest add button card badge avatar skeleton separator select dropdown-menu
```

#### File Organization

All shadcn components MUST be in `src/components/ui/`:

```
src/components/
├── ui/                    # shadcn (auto-generated, do not edit directly)
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── skeleton.tsx
│   ├── separator.tsx
│   └── select.tsx
├── BlogList.tsx           # Custom components using shadcn
├── BlogPostCard.tsx
└── BlogPost.tsx
```

#### Styling Rules

```typescript
// ✅ CORRECT - Use theme CSS variables with shadcn
<Card style={{ backgroundColor: "var(--bg-secondary)" }}>

// ✅ CORRECT - Use shadcn variants
<Button variant="outline">Click</Button>
<Badge variant="secondary">Tag</Badge>

// ❌ WRONG - Don't override shadcn with arbitrary colors
<Button className="bg-red-500">Click</Button>
```

#### Required Components for Blog

| Component   | Usage            |
| ----------- | ---------------- |
| `Card`      | Blog post cards  |
| `Avatar`    | Author images    |
| `Badge`     | Post dates, tags |
| `Button`    | CTAs, navigation |
| `Skeleton`  | Loading states   |
| `Separator` | Content dividers |
| `Select`    | Theme switcher   |

---

### 9. Framer Motion Rules

#### Client Component Requirement

All animated components MUST use `"use client"`:

```typescript
"use client";

import { motion } from "framer-motion";
```

#### Animation Patterns

##### List Stagger Animation

```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map((item) => (
    <motion.div key={item.id} variants={item}>
      {item.content}
    </motion.div>
  ))}
</motion.div>;
```

##### Card Hover Effects

```typescript
<motion.div
  whileHover={{ scale: 1.02, y: -5 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
  <Card>...</Card>
</motion.div>
```

##### Page Entrance Animation

```typescript
<motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
  Page Title
</motion.h1>
```

##### Image Zoom on Hover

```typescript
<motion.img src={imageUrl} whileHover={{ scale: 1.1 }} transition={{ duration: 0.4 }} />
```

#### Animation Timing Guidelines

| Animation Type     | Duration   | Easing           |
| ------------------ | ---------- | ---------------- |
| Micro-interactions | 0.1-0.3s   | spring (300, 20) |
| Page transitions   | 0.3-0.5s   | ease-out         |
| Stagger delay      | 0.05-0.15s | —                |
| Image zoom         | 0.3-0.5s   | ease-out         |

#### Performance Rules

```typescript
// ✅ CORRECT - Use transform properties (GPU accelerated)
whileHover={{ scale: 1.02, y: -5 }}

// ❌ AVOID - Layout-triggering properties
whileHover={{ width: "110%", height: "110%" }}
```

---

### 10. File Naming Convention

| Type              | Convention                  | Example         |
| ----------------- | --------------------------- | --------------- |
| React Components  | PascalCase                  | `BlogList.tsx`  |
| shadcn Components | lowercase (auto-generated)  | `button.tsx`    |
| Utility Functions | camelCase                   | `formatDate.ts` |
| Server Actions    | camelCase                   | `blog.ts`       |
| Hooks             | camelCase with `use` prefix | `useTheme.ts`   |

---

### 11. Directory Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   ├── blog/
│   │   ├── page.tsx          # SSG + ISR
│   │   ├── loading.tsx       # Skeleton UI
│   │   └── [slug]/
│   │       ├── page.tsx      # SSG + ISR
│   │       └── loading.tsx   # Skeleton UI
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                   # shadcn (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── BlogList.tsx          # Uses shadcn + Framer
│   ├── BlogPostCard.tsx      # Uses shadcn + Framer
│   ├── BlogPost.tsx          # Uses shadcn + Framer
│   ├── BlogListSkeleton.tsx  # Loading state
│   ├── ThemeSwitcher.tsx     # Uses shadcn Select
│   └── ImageUpload.tsx
├── actions/
│   ├── blog.ts
│   └── image.ts
└── lib/
    ├── auth.ts
    ├── blog.ts
    ├── cdn.ts
    ├── prisma.ts
    └── utils.ts              # shadcn cn() helper
```

---

### 12. Environment Variables

```env
# Required
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."

# Auth Providers
GITHUB_ID="..."
GITHUB_SECRET="..."

# CDN
CDN_UPLOAD_URL="https://catgirlsare.sexy/api/upload"
CDN_UPLOAD_API_KEY="..."
```

**Rule:** Never expose server-only env vars to client. Use `NEXT_PUBLIC_` prefix only for client-safe values.

---

## Anti-Patterns to Avoid

### ❌ Client-Side Blog Fetching

```typescript
// WRONG
"use client";
useEffect(() => {
  fetch("/api/posts").then(...);
}, []);
```

### ❌ Prisma in Client Components

```typescript
// WRONG
"use client";
import { prisma } from "@/lib/prisma";
```

### ❌ Full CDN URLs in Database

```typescript
// WRONG
coverImage: "https://b.catgirlsare.sexy/abc.webp";
```

### ❌ Dynamic Rendering for Blog

```typescript
// WRONG - Forces dynamic rendering
export const dynamic = "force-dynamic";
```

### ❌ Theme State in Server Components

```typescript
// WRONG - Breaks caching
const theme = cookies().get("theme");
```

### ❌ Framer Motion in Server Components

```typescript
// WRONG - motion requires client
export default function Page() {
  return <motion.div>...</motion.div>; // Error!
}
```

### ❌ Heavy Animations on Page Load

```typescript
// WRONG - Too many simultaneous animations
{
  posts.map((post, i) => (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: 180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: i * 0.5, duration: 1 }} // Too slow!
    />
  ));
}
```

### ❌ Modifying shadcn Source Files

```typescript
// WRONG - Edit src/components/ui/button.tsx directly
// These files are auto-generated and may be overwritten

// ✅ CORRECT - Create wrapper component or use CSS variables
```
