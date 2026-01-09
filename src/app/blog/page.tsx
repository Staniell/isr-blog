export const runtime = "nodejs";
export const revalidate = 3600; // Revalidate every hour

import { getPublishedPosts } from "@/lib/blog";
import BlogList from "@/components/BlogList";

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return <BlogList posts={posts} />;
}
