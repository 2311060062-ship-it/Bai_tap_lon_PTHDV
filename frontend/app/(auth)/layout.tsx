import { TopProgressBar } from "@/components/TopProgressBar";
import { AuthTransition } from "@/components/AuthTransition";

/**
 * Auth Layout – Không có Navbar/Footer.
 * Dùng AuthTransition riêng (slide ngang) thay PageTransition (fade) để
 * tránh hiện tượng lóa nền trắng khi chuyển giữa các trang tối.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopProgressBar />
      <AuthTransition>{children}</AuthTransition>
    </>
  );
}
