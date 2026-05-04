import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 py-16 sm:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(15,23,42,0.08),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(15,23,42,0.05),transparent_50%)]"
      />

      <div className="w-full max-w-xl">
        <div className="mb-8 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          KGNA Content Studio
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Edit, review, and publish.
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
          A focused workspace for managing page-level content across the KGNA
          website.
        </p>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Admin Dashboard
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Sign in to draft, edit, and publish page content.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              Protected
            </span>
          </div>

          <Link
            href="/admin"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            Open Admin
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3l5 5-5 5" />
            </svg>
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Need access? Contact a KGNA administrator.
        </p>
      </div>
    </main>
  );
}
