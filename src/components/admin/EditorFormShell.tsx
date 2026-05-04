"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const DirtyContext = createContext<() => void>(() => {});

export function useMarkDirty() {
  return useContext(DirtyContext);
}

export function EditorFormShell({
  action,
  children,
}: {
  action: string;
  children: React.ReactNode;
}) {
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formId = "editor-form";

  const markDirty = useCallback(() => setDirty(true), []);

  useEffect(() => {
    if (!dirty || submitting) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, submitting]);

  return (
    <DirtyContext.Provider value={markDirty}>
      <form
        id={formId}
        action={action}
        method="post"
        onInput={markDirty}
        onChange={markDirty}
        onSubmit={() => setSubmitting(true)}
        className="space-y-4 pb-24"
      >
        {children}
      </form>

      <div
        className={
          "pointer-events-none fixed inset-x-0 bottom-0 z-40 transition-transform duration-200 " +
          (dirty ? "translate-y-0" : "translate-y-full")
        }
        aria-hidden={!dirty}
      >
        <div className="pointer-events-auto border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3 sm:px-10">
            <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
              <span className="relative inline-flex h-2.5 w-2.5">
                <span className="absolute inset-0 inline-flex animate-ping rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
              </span>
              <span className="truncate font-medium">Unsaved changes</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                disabled={submitting}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Discard
              </button>
              <button
                type="submit"
                form={formId}
                disabled={!dirty || submitting}
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Spinner /> Saving…
                  </>
                ) : (
                  "Save draft"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DirtyContext.Provider>
  );
}

function Spinner() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 animate-spin"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M8 2a6 6 0 1 0 6 6" />
    </svg>
  );
}
