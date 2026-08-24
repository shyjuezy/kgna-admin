"use client";

import { useState } from "react";
import { CloudinaryUploadButton } from "@/components/admin/CloudinaryUploadButton";
import { ImageDropZone } from "@/components/admin/ImageDropZone";
import { useMarkDirty } from "@/components/admin/EditorFormShell";

export function ImageUrlField({
  label = "Image URL",
  name,
  defaultValue = "",
  folder,
  className,
}: {
  label?: string;
  name: string;
  defaultValue?: string;
  folder?: string;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const markDirty = useMarkDirty();
  // React setting the input's value does not emit an input/change event, so the
  // form shell never sees an upload. Tell it directly.
  const applyUploadedUrl = (url: string) => {
    setValue(url);
    markDirty();
  };
  return (
    <ImageDropZone
      folder={folder}
      onUploaded={applyUploadedUrl}
      className={className}
    >
      <div className="flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
          {label}
          <input
            name={name}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://…"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </label>
        <CloudinaryUploadButton
          folder={folder}
          onUploaded={applyUploadedUrl}
          className="mb-px h-[38px]"
        />
      </div>
    </ImageDropZone>
  );
}
