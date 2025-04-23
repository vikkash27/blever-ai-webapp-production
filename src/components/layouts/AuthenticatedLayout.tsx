import Link from "next/link";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import React from "react";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
     

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Optional Footer */}
      {/* <footer className="py-6 md:px-8 md:py-0 border-t"> ... </footer> */}
    </div>
  );
}