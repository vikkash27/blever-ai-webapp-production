'use client';

import { useUser } from '@clerk/nextjs';
import NavigationBar from '@/components/layouts/NavigationBar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded } = useUser();

  // Show loading state if user data is still loading
  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Include the shared NavigationBar at the top */}
      <NavigationBar />
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}