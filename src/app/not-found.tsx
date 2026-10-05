import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="container empty-page">
      <p className="eyebrow">404 · ONI STUDIO</p>
      <h1>Trang không tồn tại</h1>
      <p>Page not found. Đường dẫn có thể đã thay đổi.</p>
      <Link className="button" href="/">
        Về trang chủ / Home
      </Link>
    </main>
  );
}
