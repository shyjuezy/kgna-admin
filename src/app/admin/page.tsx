import Link from "next/link";
import { listEditablePages } from "@/lib/repository";

export default async function AdminDashboard() {
  let pages: Awaited<ReturnType<typeof listEditablePages>>;
  try {
    pages = await listEditablePages();
  } catch {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
        <h1 className="text-lg font-semibold text-amber-800">Database not configured</h1>
        <p className="mt-2 text-sm text-amber-900">
          Add DATABASE_URL in environment variables and run migrations.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Page Content</h2>
        <p className="text-sm text-slate-500">Edit each page&apos;s JSON payload</p>
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {pages.map((page) => (
          <li
            key={page.slug}
            className="rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          >
            <p className="font-semibold capitalize">{page.title}</p>
            <p className="text-slate-600">
              {page.slug} · {page.status}
            </p>
            <Link
              className="mt-3 inline-flex rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
              href={`/admin/content/${page.slug}`}
            >
              Open Editor
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
