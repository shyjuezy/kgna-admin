import { currentUser } from "@clerk/nextjs/server";

export function isClerkConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
}

export type ClerkAuthState =
  | { status: "ok"; user: { id: string; email: string } }
  | { status: "not_configured" }
  | { status: "not_authenticated" }
  | { status: "not_authorized" };

export function getAllowedAdminEmails() {
  const rawEmails = process.env.KGNA_ADMIN_EMAILS ?? "";
  return new Set(
    rawEmails
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function getAdminAuthState(): Promise<ClerkAuthState> {
  if (!isClerkConfigured()) {
    return { status: "not_configured" };
  }

  let user;
  try {
    user = await currentUser();
  } catch {
    return { status: "not_authenticated" };
  }

  if (!user) {
    return { status: "not_authenticated" };
  }

  const email = (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses?.[0]?.emailAddress ??
    ""
  ).toLowerCase();

  if (!email) {
    return { status: "not_authenticated" };
  }

  const allowedEmails = getAllowedAdminEmails();
  if (!allowedEmails.has(email)) {
    return { status: "not_authorized" };
  }

  return {
    status: "ok",
    user: {
      id: user.id,
      email,
    },
  };
}
