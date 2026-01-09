export const CDN_URL = "https://b.catgirlsare.sexy/";
export const CDN_THUMBNAIL_URL = "https://catgirlsare.sexy/";

const CDN_BASE_URLS = ["https://b.catgirlsare.sexy/", "https://catgirlsare.sexy/"];

export function stripCdnBaseUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  for (const baseUrl of CDN_BASE_URLS) {
    if (url.startsWith(baseUrl)) {
      return url.slice(baseUrl.length);
    }
  }

  return url;
}

export function isRelativePath(url: string | undefined): boolean {
  if (!url) return false;
  return !url.startsWith("http://") && !url.startsWith("https://");
}

export function getImageUrl(url: string | File | undefined): string | undefined {
  if (!url) return undefined;

  if (url instanceof File) {
    return URL.createObjectURL(url);
  }

  if (url.startsWith("blob:")) {
    return url;
  }

  if (isRelativePath(url)) {
    if (url.startsWith("thumbnail/")) {
      return `${CDN_THUMBNAIL_URL}${url}`;
    }
    return `${CDN_URL}${url}`;
  }

  return url;
}
