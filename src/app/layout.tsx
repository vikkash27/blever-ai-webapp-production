import { ClerkProvider, UserButton } from '@clerk/nextjs'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BLever.AI", // Updated Title
  description: "ESG Scoring Automation Platform", // Updated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <header style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>BLever.AI</h1>
            <UserButton afterSignOutUrl="/"/>
          </header>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}