import "server-only";
import { redirect } from "next/navigation";
import { createAuthClient } from "./supabase/server";
import { isConfigured } from "./supabase/config";
export async function adminSession() {
  if (!isConfigured()) return null;
  const db = await createAuthClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) return null;
  const { data: allowed, error: roleError } = await db.rpc("is_admin");
  if (roleError || allowed !== true) return null;
  return { db, user };
}
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
