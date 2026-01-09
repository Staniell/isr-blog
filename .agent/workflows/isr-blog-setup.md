---
description: Complete setup workflow for the ISR Blog with Next.js 16, Prisma, Neon, and Auth.js
---

# ISR Blog Setup Workflow

This workflow guides the complete implementation of a production-grade blog application.

## Phase 1: Project Foundation

### 1.1 Install Core Dependencies

```bash
npm install prisma @prisma/client @auth/core @auth/prisma-adapter next-auth@beta
npm install -D @types/bcrypt
```

### 1.2 Install UI & Animation Libraries

```bash
# Framer Motion for animations
npm install framer-motion

# shadcn/ui setup
npx shadcn@latest init
```

When prompted by shadcn init:

- Style: Default
- Base color: Slate
- CSS variables: Yes

### 1.3 Install shadcn Components

```bash
npx shadcn@latest add button card badge avatar separator skeleton
npx shadcn@latest add dropdown-menu select
```

### 1.4 Initialize Prisma

```bash
npx prisma init
```

### 1.5 Configure Environment Variables

Create `.env` file with:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth.js
AUTH_SECRET="generate-with-openssl-rand-base64-32"

# CDN
CDN_UPLOAD_URL="https://catgirlsare.sexy/api/upload"
CDN_UPLOAD_API_KEY="your-api-key"
```

---

## Phase 2: Database Schema

### 2.1 Define Prisma Schema

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  posts         Post[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
}

model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@id([identifier, token])
}

model Post {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  excerpt     String?
  content     String
  coverImage  String?  // Relative path only, e.g., "abc123.webp"
  published   Boolean  @default(false)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([published, createdAt])
  @@index([slug])
}
```

### 2.2 Push Schema to Database

```bash
npx prisma db push
```

### 2.3 Generate Prisma Client

```bash
npx prisma generate
```

---

## Phase 3: CDN Utilities

### 3.1 Create CDN Utility File

Create `src/lib/cdn.ts` with the exact utilities from the specification.

**CRITICAL RULES:**

- Database stores ONLY relative paths (e.g., `abc123.webp`)
- Never store full CDN URLs in the database
- Use `stripCdnBaseUrl()` when saving to database
- Use `getImageUrl()` when rendering images

---

## Phase 4: Auth.js Configuration

### 4.1 Create Auth Configuration

Create `src/lib/auth.ts`:

```typescript
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
});
```

### 4.2 Create Auth API Route

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
export const runtime = "nodejs";

import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

---

## Phase 5: Blog Data Layer

### 5.1 Create Prisma Client Singleton

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### 5.2 Create Blog Data Queries

Create `src/lib/blog.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// Cache tags for targeted revalidation
export const BLOG_LIST_TAG = "blog-list";
export const blogPostTag = (slug: string) => `blog-post-${slug}`;

export const getPublishedPosts = unstable_cache(
  async () => {
    return prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        createdAt: true,
        author: { select: { name: true, image: true } },
      },
    });
  },
  ["published-posts"],
  { tags: [BLOG_LIST_TAG] }
);

export const getPostBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.post.findUnique({
      where: { slug, published: true },
      include: { author: { select: { name: true, image: true } } },
    });
  },
  ["post-by-slug"],
  { tags: [] } // Tags added dynamically
);

export async function getAllPostSlugs() {
  return prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });
}
```

---

## Phase 6: Blog Pages (SSG + ISR)

### 6.1 Create Blog List Page

Create `src/app/blog/page.tsx`:

```typescript
export const runtime = "nodejs";
export const revalidate = 3600; // Revalidate every hour

import { getPublishedPosts } from "@/lib/blog";
import BlogList from "@/components/BlogList";

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return <BlogList posts={posts} />;
}
```

### 6.2 Create Blog Post Page

Create `src/app/blog/[slug]/page.tsx`:

```typescript
export const runtime = "nodejs";
export const revalidate = 3600;

import { notFound } from "next/navigation";
import { getPostBySlug, getAllPostSlugs, blogPostTag } from "@/lib/blog";
import BlogPost from "@/components/BlogPost";

export async function generateStaticParams() {
  const posts = await getAllPostSlugs();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogPost post={post} />;
}
```

---

## Phase 7: Server Actions

### 7.1 Create Blog Actions

Create `src/actions/blog.ts`:

```typescript
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { BLOG_LIST_TAG, blogPostTag } from "@/lib/blog";
import { stripCdnBaseUrl } from "@/lib/cdn";

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const coverImage = formData.get("coverImage") as string;
  const slug = formData.get("slug") as string;

  await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      coverImage: stripCdnBaseUrl(coverImage), // Always strip CDN base URL
      published: true,
      authorId: session.user.id,
    },
  });

  // Targeted revalidation
  revalidateTag(BLOG_LIST_TAG);
  revalidatePath("/blog");
}

export async function updatePost(postId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const coverImage = formData.get("coverImage") as string;

  const post = await prisma.post.update({
    where: { id: postId, authorId: session.user.id },
    data: {
      title,
      content,
      excerpt,
      coverImage: stripCdnBaseUrl(coverImage),
    },
  });

  // Targeted revalidation
  revalidateTag(BLOG_LIST_TAG);
  revalidateTag(blogPostTag(post.slug));
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
}
```

### 7.2 Create Image Upload Action

Create `src/actions/image.ts` with the exact uploadImage function from the specification.

---

## Phase 8: Theming System

### 8.1 Create Theme CSS Variables

Add to `src/app/globals.css`:

```css
:root {
  /* Light theme (default) */
  --bg-primary: #ffffff;
  --bg-secondary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --accent: #3b82f6;
}

[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --accent: #60a5fa;
}

[data-theme="purple"] {
  --bg-primary: #1e1b4b;
  --bg-secondary: #312e81;
  --text-primary: #f5f3ff;
  --text-secondary: #c4b5fd;
  --accent: #a78bfa;
}

[data-theme="yellow"] {
  --bg-primary: #fefce8;
  --bg-secondary: #fef9c3;
  --text-primary: #422006;
  --text-secondary: #854d0e;
  --accent: #eab308;
}
```

### 8.2 Create ThemeSwitcher Component with shadcn

Create `src/components/ThemeSwitcher.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const THEMES = [
  { value: "light", label: "☀️ Light" },
  { value: "dark", label: "🌙 Dark" },
  { value: "purple", label: "💜 Purple" },
  { value: "yellow", label: "🌻 Yellow" },
] as const;

type Theme = (typeof THEMES)[number]["value"];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const handleChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  if (!mounted) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Select value={theme} onValueChange={handleChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {THEMES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
}
```

### 8.3 Add Theme Script to Prevent Flash

In `src/app/layout.tsx`, add inline script before body content:

```tsx
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

---

## Phase 9: Components with shadcn & Framer Motion

### 9.1 Component File Structure

```
src/components/
├── ui/                    # shadcn components (auto-generated)
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── skeleton.tsx
│   ├── separator.tsx
│   ├── select.tsx
│   └── dropdown-menu.tsx
├── BlogList.tsx           # Animated blog grid
├── BlogPostCard.tsx       # Individual card with hover effects
├── BlogPost.tsx           # Full post view with animations
├── ThemeSwitcher.tsx      # Theme dropdown
└── ImageUpload.tsx        # Image upload with preview
```

### 9.2 BlogList Component

Create `src/components/BlogList.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import BlogPostCard from "./BlogPostCard";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  createdAt: Date;
  author: { name: string | null; image: string | null };
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function BlogList({ posts }: { posts: Post[] }) {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8 text-center"
        style={{ color: "var(--text-primary)" }}
      >
        Latest Posts
      </motion.h1>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {posts.map((post) => (
          <motion.div key={post.id} variants={item}>
            <BlogPostCard post={post} />
          </motion.div>
        ))}
      </motion.div>

      {posts.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-lg"
          style={{ color: "var(--text-secondary)" }}
        >
          No posts yet. Check back soon!
        </motion.p>
      )}
    </div>
  );
}
```

### 9.3 BlogPostCard Component

Create `src/components/BlogPostCard.tsx`:

```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/cdn";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  createdAt: Date;
  author: { name: string | null; image: string | null };
}

export default function BlogPostCard({ post }: { post: Post }) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/blog/${post.slug}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card
          className="h-full overflow-hidden cursor-pointer group"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--accent)",
          }}
        >
          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative h-48 overflow-hidden">
              <motion.img
                src={getImageUrl(post.coverImage)}
                alt={post.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          <CardHeader className="pb-2">
            <motion.h2 className="text-xl font-semibold line-clamp-2" style={{ color: "var(--text-primary)" }}>
              {post.title}
            </motion.h2>
          </CardHeader>

          <CardContent className="pb-2">
            {post.excerpt && (
              <p className="line-clamp-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                {post.excerpt}
              </p>
            )}
          </CardContent>

          <CardFooter className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author.image || undefined} />
                <AvatarFallback>{post.author.name?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {post.author.name || "Anonymous"}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {formattedDate}
            </Badge>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
}
```

### 9.4 BlogPost Component (Full Post View)

Create `src/components/BlogPost.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getImageUrl } from "@/lib/cdn";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  createdAt: Date;
  author: { name: string | null; image: string | null };
}

export default function BlogPost({ post }: { post: Post }) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Hero Section with Cover Image */}
      {post.coverImage && (
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-[60vh] w-full overflow-hidden"
        >
          <img src={getImageUrl(post.coverImage)} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-4xl"
            >
              {post.title}
            </motion.h1>
          </div>
        </motion.div>
      )}

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Title (if no cover image) */}
        {!post.coverImage && (
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            {post.title}
          </motion.h1>
        )}

        {/* Author & Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4 mb-8"
        >
          <Avatar className="h-12 w-12 ring-2 ring-offset-2" style={{ ringColor: "var(--accent)" }}>
            <AvatarImage src={post.author.image || undefined} />
            <AvatarFallback>{post.author.name?.charAt(0) || "?"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>
              {post.author.name || "Anonymous"}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {formattedDate}
            </p>
          </div>
        </motion.div>

        <Separator className="mb-8" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="prose prose-lg max-w-none"
          style={{ color: "var(--text-primary)" }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <Separator className="my-12" />

        {/* Back Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Link href="/blog">
            <Button variant="outline" className="group">
              <motion.span className="mr-2" whileHover={{ x: -3 }} transition={{ type: "spring", stiffness: 400 }}>
                ←
              </motion.span>
              Back to Blog
            </Button>
          </Link>
        </motion.div>
      </div>
    </article>
  );
}
```

### 9.5 Loading Skeleton Component

Create `src/components/BlogListSkeleton.tsx`:

```tsx
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-10 w-48 mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-full overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-5 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## Phase 10: Verification

### 10.1 Build Test

```bash
npm run build
```

Verify:

- No client-side Prisma errors
- Static pages generated for `/blog` and `/blog/[slug]`
- ISR configured correctly
- shadcn components bundled correctly
- Framer Motion animations work

### 10.2 Runtime Verification

```bash
npm run start
```

Verify:

- Blog pages load without database queries per request
- Theme switching is instant and persists
- Images load from CDN correctly
- Animations play smoothly (staggered card entrance, hover effects)
- Cards scale on hover with spring physics

---

## Critical Rules Summary

### Prisma Rules

- ✅ Allowed: Server Components, Server Actions, API Routes (Node.js runtime)
- ❌ Forbidden: Client Components, Edge Runtime

### ISR Rules

- Use `export const revalidate = <seconds>` for time-based revalidation
- Use `revalidateTag()` for targeted revalidation after mutations
- Always revalidate both `/blog` and `/blog/[slug]` after post changes

### Image Rules

- Store ONLY relative paths in database
- Never store full CDN URLs
- Use `getImageUrl()` to render images
- Use `stripCdnBaseUrl()` before saving to database

### Theme Rules

- Use CSS variables for all theme values
- Apply theme via `data-theme` attribute on `<html>`
- Use inline script to prevent flash of unstyled content
- Never affect SSG/ISR caching with theme state

### shadcn Rules

- Keep all shadcn components in `src/components/ui/`
- Customize via CSS variables, not inline styles
- Use shadcn's built-in variants for consistency

### Framer Motion Rules

- Use `"use client"` for all animated components
- Prefer spring animations for interactive elements
- Use `staggerChildren` for list animations
- Keep animations subtle (0.1-0.3s for micro-interactions)
