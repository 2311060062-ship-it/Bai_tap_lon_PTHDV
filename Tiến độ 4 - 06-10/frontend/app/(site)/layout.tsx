import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingContact } from "@/components/FloatingContact";
import { ScrollReveal } from "@/components/ScrollReveal";
import { PageTransition } from "@/components/PageTransition";
import { TopProgressBar } from "@/components/TopProgressBar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopProgressBar />
      <Navbar />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <ScrollReveal />
      <ScrollToTop />
      <FloatingContact />
    </>
  );
}
