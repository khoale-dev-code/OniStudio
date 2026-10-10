import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createAuthClient } from "./supabase/server";
import { isConfigured } from "./supabase/config";

export const adminSession = cache(async function adminSession() {
  if (!isConfigured()) return null;

  const db = await createAuthClient();
  // Do not perform an admin role query for missing/invalid sessions.
  // This also avoids racing a token refresh against the role request.
  const claimsResult = await db.auth.getClaims();
  if (claimsResult.error || !claimsResult.data?.claims) return null;

  const roleResult = await db.rpc("is_admin");
  if (roleResult.error || roleResult.data !== true) return null;

  const email =
    typeof claimsResult.data.claims.email === "string"
      ? claimsResult.data.claims.email
      : null;

  return {
    db,
    user: { email },
  };
});

export async function requireAdmin() {
  const session = await adminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireAdminPage() {
  const session = await adminSession();
  if (!session) redirect("/admin/login");
  return session;
}
