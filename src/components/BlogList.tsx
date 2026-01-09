"use client";

import { motion } from "framer-motion";
import BlogPostCard from "./BlogPostCard";
import type { BlogPostListItem } from "@/lib/blog";

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

interface BlogListProps {
  posts: BlogPostListItem[];
}

export default function BlogList({ posts }: BlogListProps) {
  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="container mx-auto max-w-6xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold mb-4 text-center"
          style={{ color: "var(--text-primary)" }}
        >
          Blog
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg text-center mb-12 max-w-2xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          Thoughts, stories, and ideas
        </motion.p>

        {posts.length > 0 ? (
          <motion.div
            key={posts.map((p) => p.id).join(",")}
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
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <p className="text-xl mb-4" style={{ color: "var(--text-secondary)" }}>
              No posts yet
            </p>
            <p style={{ color: "var(--text-secondary)" }}>Check back soon for new content!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
