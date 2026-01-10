"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getImageUrl } from "@/lib/cdn";
import type { BlogPost as BlogPostType } from "@/lib/blog";
import { deletePost } from "@/actions/blog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BlogPostProps {
  post: BlogPostType;
  isOwner?: boolean;
}

export default function BlogPost({ post, isOwner }: BlogPostProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePost(post.id);
      if (result.success) {
        router.push("/blog");
        router.refresh();
      } else {
        alert("Failed to delete post");
        setIsDeleting(false);
      }
    } catch {
      alert("Something went wrong");
      setIsDeleting(false);
    }
  };

  const coverImageUrl = getImageUrl(post.coverImage ?? undefined);

  return (
    <article className="min-h-screen bg-(--bg-primary)">
      {/* Hero Section with Cover Image */}
      {coverImageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden"
        >
          <img src={coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
            <div className="container mx-auto max-w-4xl">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
              >
                {post.title}
              </motion.h1>
            </div>
          </div>
        </motion.div>
      )}

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        {/* Title (if no cover image) */}
        {!coverImageUrl && (
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold mb-6 text-(--text-primary)"
          >
            {post.title}
          </motion.h1>
        )}

        {/* Author & Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-offset-transparent ring-accent">
              <AvatarImage src={post.author.image ?? undefined} />
              <AvatarFallback className="bg-accent text-(--bg-primary)">
                {post.author.name?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-(--text-primary)">{post.author.name || "Anonymous"}</p>
              <p className="text-sm text-(--text-secondary)">{formattedDate}</p>
            </div>
          </div>

          {/* Delete Button (Owner Only) */}
          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete Post"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-(--bg-primary) border-(--bg-secondary) text-(--text-primary)">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-(--text-primary)">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-(--text-secondary)">
                    This action cannot be undone. This will permanently delete your post and remove it from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-(--bg-secondary) text-(--text-primary) hover:bg-(--bg-secondary) hover:text-(--text-primary)">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600 border-0">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </motion.div>

        <Separator className="mb-8 bg-(--bg-secondary)" />

        {/* Excerpt */}
        {post.excerpt && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-xl md:text-2xl mb-8 leading-relaxed font-light italic text-(--text-secondary)"
          >
            {post.excerpt}
          </motion.p>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="prose prose-lg max-w-none text-(--text-primary) [--tw-prose-body:var(--text-primary)] [--tw-prose-headings:var(--text-primary)] [--tw-prose-links:var(--accent)]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <Separator className="my-12 bg-(--bg-secondary)" />

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Link href="/blog">
            <Button
              variant="outline"
              size="lg"
              className="group px-8 bg-transparent border-(--bg-secondary) text-(--text-secondary) hover:text-(--text-primary) hover:border-accent hover:bg-(--bg-secondary) transition-all duration-300"
            >
              <motion.span
                className="mr-2 inline-block text-accent"
                whileHover={{ x: -3 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
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
