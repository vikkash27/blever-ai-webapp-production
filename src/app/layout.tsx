import { ClerkProvider } from '@clerk/nextjs'; // Removed UserButton import for now
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// Removed Link import as it's not used here anymore
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// This metadata export is correct for a Server Component layout
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
    <ClerkProvider>
      <html lang="en">
        {/* Removed flex flex-col, header is gone */}
        <body className={`${inter.className} min-h-screen`}>
          {/* No header here anymore */}
          {/* Main Content Area takes full height */}
          <main>{children}</main>
          {/* Optional Footer could go here */}
        </body>
      </html>
    </ClerkProvider>
  );
}