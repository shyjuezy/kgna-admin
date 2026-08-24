export const MAX_UPLOAD_BYTES = 10_000_000;
export const ALLOWED_IMAGE_FORMATS = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "avif",
] as const;

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export type CloudinaryConfig = {
  cloudName: string;
  uploadPreset: string;
};

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) return null;
  return { cloudName, uploadPreset };
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return `Unsupported file type — use ${ALLOWED_IMAGE_FORMATS.join(", ")}`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "Image is larger than 10 MB";
  }
  return null;
}

/**
 * Unsigned upload straight to Cloudinary — the same request the upload widget
 * makes, so it obeys the same preset restrictions.
 */
export async function uploadImageToCloudinary(
  file: File,
  { cloudName, uploadPreset }: CloudinaryConfig,
  folder?: string,
): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", uploadPreset);
  if (folder) body.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body },
  );
  if (!response.ok) throw new Error("Upload failed");

  const result = (await response.json()) as { secure_url?: string };
  if (!result.secure_url) throw new Error("Upload failed");
  return result.secure_url;
}
