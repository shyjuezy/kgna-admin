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
          <h1 className="text-lg font-semibold text-amber-800">Clerk not configured</h1>
          <p className="mt-2 text-sm text-amber-900">
            Add the Clerk environment keys and admin email list before accessing this UI.
          </p>
          <Link className="mt-4 inline-block text-sm font-medium text-amber-900 underline" href="/">
            Back to home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-6 py-8 sm:px-10">
      <header className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">KGNA Admin</h1>
            <p className="text-sm text-slate-600">
              Signed in as <span className="font-medium">{auth.user.email}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white" href="/admin">
              Dashboard
            </Link>
            <UserButton />
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}
