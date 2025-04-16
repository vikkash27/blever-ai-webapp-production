import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'; // Import ClerkProvider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BLever.AI",
  description: "ESG Scoring Automation Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider> {/* Wrap the content with ClerkProvider */}
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}