'use client'; // Needed for hooks and Clerk components

import { useEffect } from 'react';
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, LineChart, ClipboardCheck, Globe, Building2 } from 'lucide-react';

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  

  // Force sign out users who arrive at the homepage
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      signOut();
    }
  }, [isLoaded, isSignedIn, signOut]);

  // Show loading state while Clerk checks auth status
  if (!isLoaded) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Show the landing page layout (users will be signed out)
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <LineChart className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-xl">BLever.AI</span>
          </div>
          <div className="flex space-x-4 items-center">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Simplify Your ESG Data Management
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
              Upload your documents, track your progress, and improve your sustainability posture with our automated ESG scoring and reporting platform.
            </p>
            <div className="flex justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
              How It Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Account</h3>
                <p className="text-slate-600">
                  Sign up and create your organization profile with basic details
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <ClipboardCheck className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Book a Demo</h3>
                <p className="text-slate-600">
                  Schedule a personalized demo call with our team to explore features
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Get Full Access</h3>
                <p className="text-slate-600">
                  After the demo, your organization will be authorized for full platform access
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-emerald-50">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">
              Ready to transform your ESG management?
            </h2>
            <p className="text-lg text-slate-600 mb-10">
              Join organizations that are streamlining their sustainability data collection, analysis, and reporting.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-10">
                Get Started Today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-slate-800 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <LineChart className="h-6 w-6 text-emerald-400" />
                <span className="font-bold text-xl text-white">BLever.AI</span>
              </div>
              <p className="max-w-xs text-slate-400">
                Empowering organizations to leverage sustainability data for better business outcomes.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-white mb-3">Product</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition">Features</a></li>
                  <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition">Demo</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition">Support</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition">About</a></li>
                  <li><a href="#" className="hover:text-white transition">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition">Legal</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-10 pt-6 text-center text-slate-400">
            <p>© {new Date().getFullYear()} BLever.AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
