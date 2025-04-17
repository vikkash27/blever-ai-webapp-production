import Link from "next/link";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import React from "react";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4 md:px-6 lg:px-8">
          {/* Logo Left-Aligned */}
          <Link href="/" className="flex items-center space-x-2 mr-8">
            <span className="font-bold text-lg">BLever.AI</span>
          </Link>
          {/* Centered Nav Section */}
          <nav className="flex flex-1 items-center justify-center space-x-8 text-sm font-medium">
            <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Dashboard
            </Link>
            <Link href="/data-management" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Data Management
            </Link>
            <Link href="/upload-guide" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Upload Guide
            </Link>
            <Link href="/company" className="transition-colors hover:text-foreground/80 text-foreground/60">
              My Company
            </Link>
          </nav>
          {/* Clerk Components Right-Aligned */}
          <div className="flex items-center space-x-4 ml-4">
            <OrganizationSwitcher hidePersonal />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Optional Footer */}
      {/* <footer className="py-6 md:px-8 md:py-0 border-t"> ... </footer> */}
    </div>
  );
}