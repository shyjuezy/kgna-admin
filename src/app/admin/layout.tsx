import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { getAdminAuthState } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await getAdminAuthState();

  if (auth.status === "not_authenticated") {
    redirect("/sign-in");
  }

  if (auth.status === "not_authorized") {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-6 py-10 sm:px-10">
        <section className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-700">Access denied</h1>
          <p className="mt-2 text-sm text-red-800">
            Your signed-in email is not in this repo&apos;s admin allow-list.
          </p>
        </section>
      </main>
    );
  }

  if (auth.status === "not_configured") {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-6 py-10 sm:px-10">
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-lg font-semibold text-amber-800">
            Clerk not configured
          </h1>
          <p className="mt-2 text-sm text-amber-900">
            Add the Clerk environment keys and admin email list before accessing
            this UI.
          </p>
          <Link
            className="mt-4 inline-block text-sm font-medium text-amber-900 underline"
            href="/"
          >
            Back to home
          </Link>
        </section>
      </main>
    );
  }

  const publicSiteUrl = process.env.PUBLIC_SITE_URL;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3 sm:px-10">
          <Link href="/admin" className="group flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-[11px] font-semibold tracking-tight text-white">
              KG
            </span>
            <span className="text-sm font-semibold text-slate-900 group-hover:text-slate-700">
              KGNA Admin
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {publicSiteUrl ? (
              <a
                href={publicSiteUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 sm:inline-flex"
              >
                View site
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
                  <path d="M6 3h7v7" />
                  <path d="M13 3 6.5 9.5" />
                  <path d="M11 11v2H3V5h2" />
                </svg>
              </a>
            ) : null}
            <UserButton
              appearance={{
                elements: { avatarBox: "h-8 w-8" },
              }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8 sm:px-10">
        {children}
      </main>
    </div>
  );
}
