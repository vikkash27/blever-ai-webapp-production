'use client';

import { SignIn } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-4xl w-full grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-6 flex flex-col justify-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Welcome back</h1>
            <p className="text-slate-600 mt-2">
              Sign in to continue to your account
            </p>
          </div>
        </div>

            <SignIn
              path="/sign-in"
              signUpUrl="/sign-up"
              /* 
               * Explicitly redirect to organization selection page after sign-in
               */
              redirectUrl="/select-organization"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "w-full shadow-none border-0 p-0",
                  header: "hidden",
                }
              }}
            />
      </div>
    </div>
  );
}