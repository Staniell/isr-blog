"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getImageUrl } from "@/lib/cdn";
import type { BlogPost as BlogPostType } from "@/lib/blog";

interface BlogPostProps {
  post: BlogPostType;
}

export default function BlogPost({ post }: BlogPostProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const coverImageUrl = getImageUrl(post.coverImage ?? undefined);

  return (
    <article className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Hero Section with Cover Image */}
      {coverImageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden"
        >
          <img src={coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

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
            className="text-3xl md:text-5xl font-bold mb-6"
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
          <Avatar
            className="h-12 w-12 ring-2 ring-offset-2 ring-offset-transparent"
            style={{
              // @ts-expect-error CSS custom properties
              "--tw-ring-color": "var(--accent)",
            }}
          >
            <AvatarImage src={post.author.image ?? undefined} />
            <AvatarFallback
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--bg-primary)",
              }}
            >
              {post.author.name?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
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

        <Separator className="mb-8" style={{ backgroundColor: "var(--bg-secondary)" }} />

        {/* Excerpt */}
        {post.excerpt && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-xl md:text-2xl mb-8 leading-relaxed font-light italic"
            style={{ color: "var(--text-secondary)" }}
          >
            {post.excerpt}
          </motion.p>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="prose prose-lg max-w-none"
          style={{
            color: "var(--text-primary)",
            // @ts-expect-error CSS custom properties
            "--tw-prose-body": "var(--text-primary)",
            "--tw-prose-headings": "var(--text-primary)",
            "--tw-prose-links": "var(--accent)",
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <Separator className="my-12" style={{ backgroundColor: "var(--bg-secondary)" }} />

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
              className="group px-8"
              style={{
                borderColor: "var(--accent)",
                color: "var(--text-primary)",
              }}
            >
              <motion.span
                className="mr-2 inline-block"
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
