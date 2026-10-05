import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
