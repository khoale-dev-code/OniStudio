export function supabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
  };
}
export function isConfigured() {
  const { url, key } = supabaseConfig();
  return Boolean(url && key);
}
