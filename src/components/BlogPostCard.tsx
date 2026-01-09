"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/cdn";
import type { BlogPostListItem } from "@/lib/blog";

interface BlogPostCardProps {
  post: BlogPostListItem;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const coverImageUrl = getImageUrl(post.coverImage ?? undefined);

  return (
    <Link href={`/blog/${post.slug}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="h-full"
      >
        <Card
          className="h-full overflow-hidden cursor-pointer group border-2 transition-colors duration-200 flex flex-col p-0 gap-0"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "transparent",
          }}
        >
          {/* Cover Image */}
          {coverImageUrl && (
            <div className="relative h-48 w-full overflow-hidden shrink-0">
              <motion.img
                src={coverImageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}

          {/* Placeholder when no image */}
          {!coverImageUrl && (
            <div
              className="h-48 w-full flex items-center justify-center relative overflow-hidden shrink-0"
              style={{
                background: `linear-gradient(135deg, var(--accent) 0%, var(--bg-secondary) 100%)`,
              }}
            >
              <span className="text-6xl opacity-30">📝</span>
            </div>
          )}

          <div className="flex flex-col grow pt-4 pb-4">
            <CardHeader className="pb-2">
              <h2
                className="text-xl font-semibold line-clamp-2 group-hover:underline decoration-2 underline-offset-2"
                style={{ color: "var(--text-primary)" }}
              >
                {post.title}
              </h2>
            </CardHeader>

            <CardContent className="pb-2 grow">
              {post.excerpt && (
                <p className="line-clamp-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {post.excerpt}
                </p>
              )}
            </CardContent>

            <CardFooter className="pt-4 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
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
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {post.author.name || "Anonymous"}
                </span>
              </div>
              <Badge
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-secondary)",
                }}
              >
                {formattedDate}
              </Badge>
            </CardFooter>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
