import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 sm:px-10">
      {isClerkConfigured() ? (
        <SignIn />
      ) : (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-xl font-semibold text-amber-900">Clerk not configured</h1>
          <p className="mt-2 text-sm text-amber-800">
            Add <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and <code>CLERK_SECRET_KEY</code> to continue.
          </p>
        </section>
      )}
    </main>
  );
}
