"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { stripCdnBaseUrl } from "@/lib/cdn";

export type CreatePostResult = {
  success: boolean;
  error?: string;
  slug?: string;
};

export type UpdatePostResult = {
  success: boolean;
  error?: string;
};

/**
 * Create a new blog post.
 * Triggers ISR revalidation after success.
 */
export async function createPost(formData: FormData): Promise<CreatePostResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string | null;
    const coverImage = formData.get("coverImage") as string | null;
    const slug = formData.get("slug") as string;

    if (!title || !content || !slug) {
      return { success: false, error: "Title, content, and slug are required" };
    }

    // Check if slug already exists
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: "A post with this slug already exists" };
    }

    await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        coverImage: stripCdnBaseUrl(coverImage ?? undefined) ?? null,
        published: true,
        authorId: session.user.id,
      },
    });

    // Targeted revalidation
    revalidatePath("/blog");

    return { success: true, slug };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

/**
 * Update an existing blog post.
 * Triggers ISR revalidation for both the list and the specific post.
 */
export async function updatePost(postId: string, formData: FormData): Promise<UpdatePostResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string | null;
    const coverImage = formData.get("coverImage") as string | null;

    if (!title || !content) {
      return { success: false, error: "Title and content are required" };
    }

    // Verify ownership
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, slug: true },
    });

    if (!existingPost) {
      return { success: false, error: "Post not found" };
    }

    if (existingPost.authorId !== session.user.id) {
      return { success: false, error: "You can only edit your own posts" };
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        excerpt: excerpt || null,
        coverImage: stripCdnBaseUrl(coverImage ?? undefined) ?? null,
      },
    });

    // Targeted revalidation
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update post:", error);
    return { success: false, error: "Failed to update post" };
  }
}

/**
 * Delete a blog post.
 * Triggers ISR revalidation after success.
 */
export async function deletePost(postId: string): Promise<UpdatePostResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, slug: true },
    });

    if (!existingPost) {
      return { success: false, error: "Post not found" };
    }

    if (existingPost.authorId !== session.user.id) {
      return { success: false, error: "You can only delete your own posts" };
    }

    await prisma.post.delete({ where: { id: postId } });

    // Targeted revalidation
    revalidatePath("/blog");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}
