'use client';

import ProtectedLayout from '@/components/layouts/ProtectedLayout';

export default function MyCompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </ProtectedLayout>
  );
}