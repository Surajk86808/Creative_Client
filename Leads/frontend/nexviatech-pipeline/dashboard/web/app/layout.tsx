import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexviaTech Pipeline Dashboard",
  description: "Real-time pipeline monitoring",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
