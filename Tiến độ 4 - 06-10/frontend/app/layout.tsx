import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "CarRental - Thuê xe ô tô tự lái cao cấp",
  description:
    "Trải nghiệm dịch vụ thuê xe ô tô tự lái chuyên nghiệp, đa dạng các dòng xe xăng và xe điện hiện đại.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}
