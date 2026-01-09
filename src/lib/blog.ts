import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// Type for blog post list items
export type BlogPostListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  createdAt: Date;
  author: { name: string | null; image: string | null };
};

// Type for full blog post
export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: { name: string | null; image: string | null };
};

/**
 * Get all published posts for the blog list page.
 * Cached with time-based revalidation.
 */
export const getPublishedPosts = unstable_cache(
  async (): Promise<BlogPostListItem[]> => {
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
  { revalidate: 3600 }
);

/**
 * Get a single post by slug.
 * Cached with time-based revalidation.
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const cachedFn = unstable_cache(
    async () => {
      return prisma.post.findUnique({
        where: { slug, published: true },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          content: true,
          coverImage: true,
          createdAt: true,
          updatedAt: true,
          author: { select: { name: true, image: true } },
        },
      });
    },
    [`post-${slug}`],
    { revalidate: 3600 }
  );

  return cachedFn();
}

/**
 * Get all post slugs for static generation.
 * Used by generateStaticParams.
 */
export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
  return prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });
}
