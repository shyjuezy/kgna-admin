"use client";

import { useState } from "react";
import { CloudinaryUploadButton } from "@/components/admin/CloudinaryUploadButton";

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
  return (
    <div className={`flex items-end gap-2 ${className ?? ""}`}>
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
        onUploaded={(url) => setValue(url)}
        className="mb-px h-[38px]"
      />
    </div>
  );
}
