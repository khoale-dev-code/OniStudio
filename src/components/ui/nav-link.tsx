"use client";
import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";
function PendingIndicator() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span className="navigation-pending" role="status">
      <span className="sr-only">Loading / Đang chuyển trang</span>
    </span>
  ) : null;
}
export default function NavLink({
  children,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <PendingIndicator />
    </Link>
  );
}
