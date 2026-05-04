import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-6 px-6 py-16 sm:px-10">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">KGNA Admin</h1>
        <p className="mt-2 text-slate-600">
          Use this app to edit page-level JSON content and publish updates for the KGNA website.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Editor</h2>
          <p className="mt-2 text-sm text-slate-600">
            Go to the protected admin dashboard.
          </p>
          <Link className="mt-4 inline-block rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white" href="/admin">
            Open Admin
          </Link>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Public API</h2>
          <p className="mt-2 text-sm text-slate-600">
            Consume page payloads in the website app.
          </p>
          <Link className="mt-4 inline-block rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white" href="/api/public/pages">
            Public Pages Endpoint
          </Link>
        </article>
      </section>
    </main>
  );
}
