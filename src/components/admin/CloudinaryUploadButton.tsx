"use client";

import { useRef, useState } from "react";

const SCRIPT_SRC = "https://upload-widget.cloudinary.com/global/all.js";

type CloudinaryWidget = {
  open: () => void;
  close: () => void;
};

type CloudinaryResult = {
  event?: string;
  info?: { secure_url?: string };
};

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: CloudinaryResult) => void,
      ) => CloudinaryWidget;
    };
  }
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (window.cloudinary) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Cloudinary script failed to load")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Cloudinary script failed to load"));
    document.head.appendChild(script);
  });
}

export function CloudinaryUploadButton({
  onUploaded,
  folder = "kgna",
  className,
  label = "Upload image",
}: {
  onUploaded: (url: string) => void;
  folder?: string;
  className?: string;
  label?: string;
}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const widgetRef = useRef<CloudinaryWidget | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!cloudName || !uploadPreset) {
    return (
      <button
        type="button"
        disabled
        title="Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to enable uploads"
        className={
          "inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-400 " +
          (className ?? "")
        }
      >
        <UploadIcon /> Upload disabled
      </button>
    );
  }

  const open = async () => {
    setError(null);
    setLoading(true);
    try {
      await loadScript();
      if (!window.cloudinary) {
        throw new Error("Cloudinary widget not available");
      }
      if (!widgetRef.current) {
        widgetRef.current = window.cloudinary.createUploadWidget(
          {
            cloudName,
            uploadPreset,
            folder,
            sources: ["local", "url", "camera"],
            multiple: false,
            resourceType: "image",
            clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "gif", "avif"],
            maxFileSize: 10_000_000,
            showAdvancedOptions: false,
            showUploadMoreButton: false,
            singleUploadAutoClose: true,
            styles: {
              palette: {
                window: "#FFFFFF",
                sourceBg: "#F8FAFC",
                windowBorder: "#E2E8F0",
                tabIcon: "#0F172A",
                inactiveTabIcon: "#94A3B8",
                menuIcons: "#475569",
                link: "#0F172A",
                action: "#10B981",
                inProgress: "#0F172A",
                complete: "#10B981",
                error: "#E11D48",
                textDark: "#0F172A",
                textLight: "#FFFFFF",
              },
            },
          },
          (err, result) => {
            if (err) {
              setError("Upload failed");
              return;
            }
            if (result?.event === "success" && result.info?.secure_url) {
              onUploaded(result.info.secure_url);
            }
          },
        );
      }
      widgetRef.current.open();
    } catch {
      setError("Could not open uploader");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={open}
        disabled={loading}
        className={
          "inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 " +
          (className ?? "")
        }
      >
        <UploadIcon />
        {loading ? "Opening…" : label}
      </button>
      {error ? <p className="text-[11px] text-rose-600">{error}</p> : null}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 11V3" />
      <path d="M4 7l4-4 4 4" />
      <path d="M3 13h10" />
    </svg>
  );
}
