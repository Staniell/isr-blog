export const runtime = "nodejs";
export const revalidate = 3600;

import { notFound } from "next/navigation";
import { getPostBySlug, getAllPostSlugs } from "@/lib/blog";
import BlogPost from "@/components/BlogPost";
import { auth } from "@/lib/auth";

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

  const session = await auth();
  const isOwner = session?.user?.id === post.authorId;

  return <BlogPost post={post} isOwner={isOwner} />;
}
