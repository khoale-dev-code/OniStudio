import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isConfigured, supabaseConfig } from "@/lib/supabase/config";
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const prefixed = path === "/en" || path.startsWith("/en/");
  // Preserve locale across an internal rewrite that re-enters proxy (e.g. local host normalization).
  // This header affects presentation only, never authentication or authorization.
  const english = prefixed || request.headers.get("x-oni-locale") === "en";
  const cleanPath = prefixed ? path.slice(3) || "/" : path;
  const headers = new Headers(request.headers);
  headers.set("x-oni-locale", english ? "en" : "vi");
  headers.set("x-oni-path", cleanPath);
  // Admin and API endpoints are not localized.
  if (
    english &&
    (cleanPath.startsWith("/admin") || cleanPath.startsWith("/api"))
  )
    return NextResponse.redirect(new URL(cleanPath, request.url));
  const url = request.nextUrl.clone();
  url.pathname = cleanPath;
  let response = prefixed
    ? NextResponse.rewrite(url, { request: { headers } })
    : NextResponse.next({ request: { headers } });
  if (
    isConfigured() &&
    (cleanPath.startsWith("/admin") || cleanPath.startsWith("/api/"))
  ) {
    const { url: dbUrl, key } = supabaseConfig();
    const db = createServerClient(dbUrl, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          headers.set("cookie", request.cookies.toString());
          response = NextResponse.next({ request: { headers } });
          values.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
    await db.auth.getClaims();
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}
export const config = {
  matcher: ["/((?!_next|images|favicon|icon|robots.txt|sitemap.xml|.*\\.).*)"],
};