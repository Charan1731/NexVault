import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexVault",
  description: "NexVault is a platform for storing and managing your digital assets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
          <footer className="futuristic-footer mt-auto">
            <div className="flex items-center justify-center py-4 px-4">
              <p className="text-xs font-mono tracking-wider footer-text">
                <span className="lightning-icon">⚡</span> Powered by NexVault <span className="opacity-60">|</span> Securing Digital Frontiers <span className="opacity-60">|</span> 
                <a 
                  href="https://github.com/Charan1731" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity duration-200 ml-1"
                >
                  GitHub
                </a> <span className="lightning-icon">⚡</span>
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
