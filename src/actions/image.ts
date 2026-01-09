"use server";

import { stripCdnBaseUrl } from "@/lib/cdn";

export type ImageUploadResult = {
  success: boolean;
  error?: string;
  imageUrl?: string;
  thumbUrl?: string;
  deletionUrl?: string;
};

/**
 * Upload an image to the CDN.
 * Returns relative paths (CDN base URL stripped) for database storage.
 */
export async function uploadImage(formData: FormData): Promise<ImageUploadResult> {
  try {
    const file = formData.get("file") as File | null;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "Invalid file type" };
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: "File exceeds 5MB limit" };
    }

    const uploadFormData = new FormData();
    uploadFormData.append("key", process.env.CDN_UPLOAD_API_KEY || "");
    uploadFormData.append("file", file);

    const response = await fetch(process.env.CDN_UPLOAD_URL || "https://catgirlsare.sexy/api/upload", {
      method: "POST",
      body: uploadFormData,
    });

    if (!response.ok) {
      return { success: false, error: "CDN upload failed" };
    }

    const result = await response.json();

    return {
      success: true,
      imageUrl: stripCdnBaseUrl(result.url),
      thumbUrl: stripCdnBaseUrl(result.thumb_url),
      deletionUrl: stripCdnBaseUrl(result.deletion_url),
    };
  } catch {
    return { success: false, error: "Image upload failed" };
  }
}
