'use client';

import { CreateOrganization } from "@clerk/nextjs";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function OrganizationCreationPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (error === 'unauthorized_organization') {
      setErrorMessage('The selected organization is not authorized to access this application yet.');
    } else {
      setErrorMessage(null);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center">
          <Building2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
          <CardTitle className="text-2xl font-semibold">Create Your Organization</CardTitle>
          <CardDescription className="mt-2">
            Please add the name of your business to continue
          </CardDescription>
        </div>

        {errorMessage && (
          <div className="p-3 bg-amber-50 text-amber-700 border border-amber-200 rounded">
            {errorMessage}
          </div>
        )}
        
        <div className="bg-white shadow-lg border border-slate-200 rounded-lg p-6">
          <CreateOrganization
            afterCreateOrganizationUrl="/demo-request"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-none border-0 p-0",
                logoBox: "hidden",
                headerTitle: "hidden",
                headerSubtitle: "hidden"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}