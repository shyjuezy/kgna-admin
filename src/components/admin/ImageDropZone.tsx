"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  getCloudinaryConfig,
  uploadImageToCloudinary,
  validateImageFile,
} from "@/components/admin/cloudinary";

export function ImageDropZone({
  onUploaded,
  folder = "kgna",
  className,
  children,
}: {
  onUploaded: (url: string) => void;
  folder?: string;
  className?: string;
  children: ReactNode;
}) {
  const config = getCloudinaryConfig();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // dragenter/dragleave fire for every child element, so count them.
  const depth = useRef(0);

  if (!config) {
    return <div className={className}>{children}</div>;
  }

  const hasFiles = (event: React.DragEvent) =>
    Array.from(event.dataTransfer.types).includes("Files");

  const reset = () => {
    depth.current = 0;
    setDragging(false);
  };

  const onDrop = async (event: React.DragEvent) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    reset();

    const file = event.dataTransfer.files[0];
    if (!file) return;

    const invalid = validateImageFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }

    setError(null);
    setUploading(true);
    try {
      onUploaded(await uploadImageToCloudinary(file, config, folder));
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`relative ${className ?? ""}`}
      title="Drop an image here to upload"
      onDragEnter={(event) => {
        if (!hasFiles(event)) return;
        event.preventDefault();
        depth.current += 1;
        setDragging(true);
      }}
      onDragOver={(event) => {
        // Without this the drop never fires and the browser opens the file.
        if (hasFiles(event)) event.preventDefault();
      }}
      onDragLeave={(event) => {
        if (!hasFiles(event)) return;
        depth.current -= 1;
        if (depth.current <= 0) reset();
      }}
      onDrop={onDrop}
    >
      {children}
      {uploading ? (
        <p className="mt-1 text-[11px] text-slate-500">Uploading…</p>
      ) : error ? (
        <p className="mt-1 text-[11px] text-rose-600">{error}</p>
      ) : null}
      {dragging ? (
        <div className="pointer-events-none absolute inset-0 -m-1 flex items-center justify-center rounded-md border-2 border-dashed border-emerald-500 bg-emerald-50/80 text-xs font-medium text-emerald-700">
          Drop image to upload
        </div>
      ) : null}
    </div>
  );
}
