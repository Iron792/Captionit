import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaptionForge",
  description: "Turn your videos into scroll-stopping stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}