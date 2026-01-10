import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Link from "next/link";
import Image from "next/image";
import NavbarActions from "@/components/NavbarActions";
import { auth } from "@/lib/auth";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-(--bg-primary)`}>
        {/* Header */}
        <header className="sticky top-0 z-50 transition-all duration-300 backdrop-blur-md bg-transparent border-b border-white/5">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="rounded-lg p-1 transition-all group-hover:bg-white/5">
                <Image
                  src="/images/logo.png"
                  alt="ISR"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain invert dark:invert-0"
                />
              </div>
              <span className="text-lg font-bold tracking-tight opacity-90 group-hover:opacity-100 transition-opacity text-(--text-primary)">
                ISR
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/blog"
                className="text-sm font-medium hover:text-accent transition-colors opacity-80 hover:opacity-100 text-(--text-secondary)"
              >
                Blog
              </Link>
              <ThemeSwitcher />
              <NavbarActions session={session} />
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="border-t py-6 bg-transparent border-(--bg-secondary)">
          <div className="container mx-auto px-4 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
              <Image
                src="/images/logo.png"
                alt="ISR"
                width={16}
                height={16}
                className="w-4 h-4 object-contain invert dark:invert-0"
              />
              <span className="font-medium text-xs tracking-wider uppercase text-(--text-primary)">ISR Blog</span>
            </div>
            <p className="text-xs font-light text-center text-(--text-secondary)">
              &copy; {new Date().getFullYear()} ISR Blog. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
