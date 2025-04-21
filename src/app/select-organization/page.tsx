'use client';

import { useUser, useClerk, OrganizationSwitcher } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Building2 } from 'lucide-react';

export default function SelectOrganizationPage() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();

    // Check if user data is still loading
    if (!isLoaded) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    // Check if user is logged in
    if (!user) {
        // Should be handled by middleware, but good practice to check
        router.push('/sign-in');
        return null;
    }

    const publicMetadata = user.publicMetadata ?? {};
    const hasMembership = user.organizationMemberships && user.organizationMemberships.length > 0;

    // If user has joined an org but is not authorized yet, show pending message
    if (hasMembership && publicMetadata.authorized !== true) {
        return (
            <div className="container mx-auto p-4 max-w-md flex flex-col items-center justify-center min-h-screen">
                <Alert className="mb-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Approval Pending</AlertTitle>
                    <AlertDescription>
                        You have requested to join an organization. Please wait for an administrator to approve your 
                        request. You will be able to access the dashboard once your request is approved.
                    </AlertDescription>
                </Alert>
                <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => router.push('/')}>Go to Homepage</Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => signOut({ redirectUrl: '/' })} 
                        className="ml-2"
                    >
                        Sign Out
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl flex flex-col items-center justify-center min-h-screen py-8 px-4 bg-gradient-to-b from-slate-50 to-slate-100">
            <div className="text-center mb-6">
                <Building2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                <h1 className="text-2xl font-semibold">Select or Join an Organization</h1>
                <p className="text-muted-foreground mt-2">Use the organization switcher below to join an existing organization</p>
            </div>

            <div className="w-full bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
                <div className="text-center mb-4">
                    <h2 className="text-lg font-medium">Available Organizations</h2>
                    <p className="text-sm text-slate-500">Select from the list below or create a new one</p>
                </div>
                <div className="flex justify-center">
                    <OrganizationSwitcher 
                        hidePersonal={true}
                        appearance={{
                            elements: {
                                organizationSwitcherTrigger: "py-2 px-4 border border-slate-200 rounded-md",
                                organizationPreviewTextContainer: "font-medium",
                                organizationSwitcherPopoverCard: "shadow-lg border border-slate-200",
                                organizationPreviewSecondaryIdentifier: "text-sm text-slate-500"
                            }
                        }}
                    />
                </div>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Want to onboard your own organization?</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        If you don&apos;t see your organization in the list above, book a call with our team to get set up.
                    </p>
                    <a href="https://calendly.com/bleverai/demo" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">Book a Demo Call</Button>
                    </a>
                </CardContent>
            </Card>
        </div>
    );
}