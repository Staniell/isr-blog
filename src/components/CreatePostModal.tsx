"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// Zod validation schema
const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  excerpt: z.string().optional(),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

type PostFormData = z.infer<typeof postSchema>;

// Helper: generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function CreatePostModal() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
    },
  });

  // Watch title for auto-slug generation
  const watchedTitle = watch("title");

  useEffect(() => {
    if (!slugManuallyEdited && watchedTitle) {
      setValue("slug", generateSlug(watchedTitle));
    }
  }, [watchedTitle, slugManuallyEdited, setValue]);

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      // Upload cover image if provided
      let coverImageUrl: string | null = null;
      if (coverImageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", coverImageFile);
        const uploadResult = await uploadImage(imageFormData);
        if (!uploadResult.success) {
          setServerError(uploadResult.error || "Image upload failed");
          setIsLoading(false);
          return;
        }
        coverImageUrl = uploadResult.imageUrl || null;
      }

      // Create post with form data
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("slug", data.slug);
      formData.append("excerpt", data.excerpt || "");
      formData.append("content", data.content);
      if (coverImageUrl) {
        formData.append("coverImage", coverImageUrl);
      }

      const result = await createPost(formData);

      if (result.success) {
        setOpen(false);
        reset();
        setCoverImageFile(null);
        setSlugManuallyEdited(false);
        router.refresh();
      } else {
        setServerError(result.error || "Failed to create post.");
      }
    } catch (err: any) {
      setServerError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when modal closes
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      reset();
      setCoverImageFile(null);
      setSlugManuallyEdited(false);
      setServerError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-accent hover:bg-accent/90 text-white border-0">
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-(--bg-primary) border-(--bg-secondary) text-(--text-primary)">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription className="text-(--text-secondary)">
            Write a new blog post. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {serverError && (
            <div className="bg-red-500/15 text-red-500 text-sm p-3 rounded-md border border-red-500/20">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-(--text-primary)">
                Title
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter post title..."
                className="bg-(--bg-secondary) border-transparent text-(--text-primary) placeholder:text-(--text-secondary)"
              />
              {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-(--text-primary)">
                Slug (URL)
              </Label>
              <Input
                id="slug"
                {...register("slug", {
                  onChange: () => setSlugManuallyEdited(true),
                })}
                placeholder="my-new-post"
                className="bg-(--bg-secondary) border-transparent text-(--text-primary) placeholder:text-(--text-secondary)"
              />
              {errors.slug && <p className="text-red-500 text-xs">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt" className="text-(--text-primary)">
              Excerpt
            </Label>
            <Textarea
              id="excerpt"
              {...register("excerpt")}
              placeholder="Short summary..."
              className="h-20 bg-(--bg-secondary) border-transparent text-(--text-primary) placeholder:text-(--text-secondary)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-(--text-primary)">
              Content (Markdown)
            </Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder="# Hello World"
              className="h-40 font-mono bg-(--bg-secondary) border-transparent text-(--text-primary) placeholder:text-(--text-secondary)"
            />
            {errors.content && <p className="text-red-500 text-xs">{errors.content.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage" className="text-(--text-primary)">
              Cover Image
            </Label>
            <Input
              id="coverImage"
              type="file"
              accept="image/*"
              className="bg-(--bg-secondary) border-transparent text-(--text-primary) file:text-(--text-primary) file:bg-(--bg-primary) file:border-(--bg-secondary)"
              onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
            />
            {coverImageFile && <p className="text-xs text-(--text-secondary)">Selected: {coverImageFile.name}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="text-(--text-primary) hover:bg-(--bg-secondary) hover:text-(--text-primary)"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90 text-white">
              {isLoading ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
