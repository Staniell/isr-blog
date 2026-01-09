"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/actions/blog";
import { uploadImage } from "@/actions/image";

export default function CreatePostModal() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("excerpt", excerpt);
      formData.append("content", content);

      await createPost(formData);

      setOpen(false);
      setTitle("");
      setSlug("");
      setExcerpt("");
      setContent("");
      setCoverImageFile(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0">
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[var(--bg-primary)] border-[var(--bg-secondary)] text-[var(--text-primary)]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription className="text-[var(--text-secondary)]">
            Write a new blog post. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="bg-red-500/15 text-red-500 text-sm p-3 rounded-md border border-red-500/20">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[var(--text-primary)]">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                className="bg-[var(--bg-secondary)] border-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-[var(--text-primary)]">
                Slug (URL)
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-new-post"
                className="bg-[var(--bg-secondary)] border-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt" className="text-[var(--text-primary)]">
              Excerpt
            </Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary..."
              className="h-20 bg-[var(--bg-secondary)] border-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-[var(--text-primary)]">
              Content (Markdown)
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Hello World"
              className="h-40 font-mono bg-[var(--bg-secondary)] border-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage" className="text-[var(--text-primary)]">
              Cover Image
            </Label>
            <Input
              id="coverImage"
              type="file"
              accept="image/*"
              className="bg-[var(--bg-secondary)] border-transparent text-[var(--text-primary)] file:text-[var(--text-primary)] file:bg-[var(--bg-primary)] file:border-[var(--bg-secondary)]"
              onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
            >
              {isLoading ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
