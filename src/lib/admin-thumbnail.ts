/** Small Cloudinary preview for admin grids; original URLs remain untouched in forms. */
export function adminThumbnailUrl(source: string, width = 420): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return source;
  const prefix = `https://res.cloudinary.com/${cloud}/image/upload/`;
  if (!source.startsWith(prefix)) return source;
  const safeWidth = Math.min(960, Math.max(120, Math.round(width)));
  return `${prefix}c_limit,w_${safeWidth},q_auto,f_auto/${source.slice(prefix.length)}`;
}
