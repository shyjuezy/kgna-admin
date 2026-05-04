import Link from "next/link";
import { listEditablePages } from "@/lib/repository";

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (Number.isNaN(then)) return "—";
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.round(mo / 12)}y ago`;
}

export default async function AdminDashboard() {
  let pages: Awaited<ReturnType<typeof listEditablePages>>;
  try {
    pages = await listEditablePages();
  } catch {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
        <h1 className="text-lg font-semibold text-amber-800">
          Database not configured
        </h1>
        <p className="mt-2 text-sm text-amber-900">
          Add DATABASE_URL in environment variables and run migrations.
        </p>
      </section>
    );
  }

  const sorted = [...pages].sort((a, b) => {
    if (a.status !== b.status) return a.status === "draft" ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
  const drafts = pages.filter((p) => p.status === "draft").length;
  const published = pages.length - drafts;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Pages
        </h1>
        <p className="text-sm text-slate-600">
          {pages.length} total
          <span className="mx-2 text-slate-300">·</span>
          <span className="text-emerald-700">{published} published</span>
          <span className="mx-2 text-slate-300">·</span>
          <span className="text-slate-700">
            {drafts} draft{drafts === 1 ? "" : "s"}
          </span>
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((page) => {
          const isPublished = page.status === "published";
          return (
            <li key={page.slug}>
              <Link
                href={`/admin/content/${page.slug}`}
                className="group flex h-full flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {page.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      /{page.slug}
                    </p>
                  </div>
                  <span
                    className={
                      "shrink-0 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium " +
                      (isPublished
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border border-slate-200 bg-slate-50 text-slate-600")
                    }
                  >
                    <span
                      className={
                        "h-1.5 w-1.5 rounded-full " +
                        (isPublished ? "bg-emerald-500" : "bg-slate-400")
                      }
                    />
                    {isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Updated {formatRelative(page.updatedAt)}</span>
                  <span className="inline-flex items-center gap-1 text-slate-400 transition group-hover:text-slate-700">
                    Edit
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
                      <path d="M6 3l5 5-5 5" />
                    </svg>
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
