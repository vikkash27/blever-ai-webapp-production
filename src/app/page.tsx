'use client'; // Needed for hooks and Clerk components

import { useEffect } from 'react';
import { useUser, SignIn } from "@clerk/nextjs";
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Redirect to dashboard if user is already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while Clerk checks auth status
  if (!isLoaded) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // If signed out, show the login page layout
  if (!isSignedIn) {
    return (
      // Use min-h-screen as the header is removed from this layout
      <div className="flex min-h-screen">
        {/* Left Side (2/3 width) */}
        <div className="w-2/3 bg-muted/40 p-10 flex flex-col justify-center items-center text-center">
          {/* You can add a logo here */}
          {/* <Image src="/your-logo.svg" alt="BLever.AI Logo" width={200} height={100} /> */}
          <h1 className="text-4xl font-bold mb-4">Welcome to BLever.AI</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Automate your ESG scoring and reporting. Upload your documents, track your progress, and improve your sustainability posture.
          </p>
          {/* Add more info or visuals as needed */}
        </div>

        {/* Right Side (1/3 width) */}
        <div className="w-1/3 p-10 flex flex-col justify-center items-center">
          <SignIn routing="hash" signUpUrl="/sign-up" />
        </div>
      </div>
    );
  }

  // Return null or a loading indicator while redirecting
  return null;
}
