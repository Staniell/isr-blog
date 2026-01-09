"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div
      className="min-h-[calc(100vh-8rem)] flex items-center justify-center"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
            ISR Blog
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            A production-grade blog built with Next.js 16, Prisma, and Incremental Static Regeneration.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/blog">
            <Button
              size="lg"
              className="px-8 text-lg bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0 transition-all duration-300 shadow-lg shadow-[var(--accent)]/20"
            >
              Read the Blog
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            {
              title: "Static Generation",
              description: "Pages are pre-rendered at build time for instant loading",
              emoji: "⚡",
            },
            {
              title: "ISR Revalidation",
              description: "Content updates automatically without full rebuilds",
              emoji: "🔄",
            },
            {
              title: "Beautiful Design",
              description: "Smooth animations with shadcn/ui and Framer Motion",
              emoji: "✨",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              className="p-6 rounded-lg"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <div className="text-4xl mb-4">{feature.emoji}</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                {feature.title}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
