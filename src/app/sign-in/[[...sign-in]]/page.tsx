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

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 p-2 rounded-full text-emerald-700 mt-0.5">
                <KeyRound size={18} />
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Secure access</h3>
                <p className="text-sm text-slate-600">Sign in with your email or connect with Google</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="md:col-span-3 shadow-lg border-slate-200">
          <CardHeader className="sm:text-center">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignIn
              path="/sign-in"
              signUpUrl="/sign-up"
              /* 
               * We'll let middleware handle redirects based on authorization status
               * rather than hardcoding the redirectUrl here
               */
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "w-full shadow-none border-0 p-0",
                  header: "hidden",
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}