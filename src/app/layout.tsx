import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ISR Blog",
  description: "A production-grade blog with Next.js 16, Prisma, and ISR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme flash prevention script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme) {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-50 border-b backdrop-blur-sm"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--bg-secondary)",
          }}
        >
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold hover:opacity-80 transition-opacity"
              style={{ color: "var(--text-primary)" }}
            >
              ISR Blog
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/blog"
                className="text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ color: "var(--text-secondary)" }}
              >
                Blog
              </Link>
              <ThemeSwitcher />
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main>{children}</main>

        {/* Footer */}
        <footer
          className="border-t py-8"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--bg-secondary)",
          }}
        >
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Built with Next.js 16, Prisma, and ISR
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
