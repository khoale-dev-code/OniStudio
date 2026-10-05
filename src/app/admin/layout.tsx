import type { Metadata } from "next";
import { AdminSnackbar } from "@/components/admin/admin-snackbar";

export const metadata: Metadata = {
  title: "Quản trị Oni Studio",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <AdminSnackbar />
    </>
  );
}
