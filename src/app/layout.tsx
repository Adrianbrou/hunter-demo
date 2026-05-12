import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hunter - Plant Floor AI Assistant",
  description:
    "AI-powered operator assistant for high-voltage cable manufacturing. Built for the Southwire Huntersville plant.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
