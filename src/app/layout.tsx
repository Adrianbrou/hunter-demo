import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

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
    <html lang="en" className={`dark ${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-background text-foreground antialiased min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
