import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Hot News",
  description: "Curated AI product, model, and tool updates."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
