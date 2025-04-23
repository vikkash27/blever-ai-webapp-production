'use client';

import { useState, useEffect } from 'react';
import { useUser, OrganizationSwitcher, useOrganization, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Building2, 
  RefreshCw,
  ArrowRight, 
  CalendarClock,
  AlertCircle,
  CheckCircle,
  LogOut
} from 'lucide-react';

export default function OrganizationSelectionPage() {
  const { isLoaded: isUserLoaded } = useUser();
  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const router = useRouter();
  const { signOut } = useClerk();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info' | null, text: string}>({
    type: null,
    text: ''
  });

  // Handle sign out and return to home
  const handleReturnToStart = () => {
    signOut(() => {
      // Will redirect to homepage after sign out
      window.location.href = "/";
    });
  };

  // Debug organization details
  useEffect(() => {
    if (isOrgLoaded && organization) {
      console.log("Organization ID:", organization.id);
      console.log("Organization Name:", organization.name);
      console.log("Public Metadata:", organization.publicMetadata);
    }
  }, [isOrgLoaded, organization]);

  // Check if current organization has access permission
  useEffect(() => {
    if (isOrgLoaded && organization) {
      const publicMetadata = organization.publicMetadata || {};
      
      console.log("Full organization object:", JSON.stringify(organization, null, 2));
      console.log("Public metadata:", JSON.stringify(publicMetadata, null, 2));
      
      // Handle different ways the access value could be stored
      let accessValue = publicMetadata.access;
      
      // If access is stored as a JSON string, parse it
      if (typeof accessValue === 'string' && (accessValue.toLowerCase() === 'true' || accessValue.toLowerCase() === 'false')) {
        accessValue = accessValue.toLowerCase() === 'true';
      }
      
      // Check for boolean true or string "true" (case insensitive)
      const hasAccessPermission = accessValue === true || 
        (typeof accessValue === 'string' && accessValue.toLowerCase() === 'true');
      
      console.log("Raw access value:", accessValue);
      console.log("Access value type:", typeof accessValue);
      console.log("Has access permission:", hasAccessPermission);
      
      setHasAccess(hasAccessPermission);
      
      if (hasAccessPermission) {
        setMessage({
          type: 'success',
          text: 'Your organization has access to the dashboard. You can proceed.'
        });
      } else {
        setMessage({
          type: 'info',
          text: 'This organization is awaiting access approval from an administrator.'
        });
      }
    } else if (isOrgLoaded && !organization) {
      setMessage({
        type: 'info',
        text: 'Please select an organization to continue.'
      });
    }
  }, [isOrgLoaded, organization]);

  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Force organization data refresh
    setTimeout(() => {
      // Re-fetch organization data
      window.location.reload();
    }, 1000);
  };

  // Handle proceed button click
  const handleProceed = () => {
    if (hasAccess && organization) {
      router.push('/dashboard');
    }
  };

  // For debugging - shows current organization details
  const debugOrganization = () => {
    if (organization) {
      console.log("Current organization:", organization);
      console.log("Public metadata:", organization.publicMetadata);
      alert(`Organization: ${organization.name}\nAccess: ${organization.publicMetadata?.access}\nHasAccess state: ${hasAccess}`);
    } else {
      alert("No organization selected");
    }
  };

  // Show loading state if data is still loading
  if (!isUserLoaded || !isOrgLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl flex flex-col items-center justify-center min-h-screen py-8 px-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="text-center mb-6">
        <Building2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
        <h1 className="text-2xl font-semibold">Select Your Organization</h1>
        <p className="text-muted-foreground mt-2">Please select an organization to access the dashboard</p>
      </div>

      {/* Organization Selection Card */}
      <Card className="w-full bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Available Organizations</CardTitle>
          <CardDescription>
            Select from the list below or refresh if you don&apos;t see your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Organization Switcher */}
          <div className="flex justify-center mb-6">
            <div className="w-full">
              <OrganizationSwitcher 
                hidePersonal={true}
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    organizationSwitcherTrigger: "w-full py-2 px-4 border border-slate-200 rounded-md",
                    organizationPreviewTextContainer: "font-medium",
                    organizationSwitcherPopoverCard: "shadow-lg border border-slate-200",
                    organizationPreviewSecondaryIdentifier: "text-sm text-slate-500"
                  }
                }}
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mb-6">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Organizations'}
            </Button>
            
            {/* Debug button - can be removed in production */}
            <Button
              variant="ghost"
              onClick={debugOrganization}
              size="sm"
              className="text-xs text-slate-500"
            >
              Check Status
            </Button>
          </div>

          {/* Status Message */}
          {message.type && (
            <Alert className={`mb-6 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : message.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{message.type === 'success' ? 'Access Granted' : message.type === 'error' ? 'Error' : 'Information'}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Proceed Button */}
          <Button 
            onClick={handleProceed} 
            disabled={!hasAccess || !organization}
            className="w-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2"
          >
            Proceed to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Onboarding Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Want to onboard your own organization?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            If you don&apos;t see your organization in the list above, book a call with our team to get set up.
          </p>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="bg-emerald-100 p-2 rounded-full text-emerald-700 mt-0.5 flex-shrink-0">
                <CalendarClock size={18} />
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Schedule a Demo</h3>
                <p className="text-sm text-slate-600">Get a personalized walkthrough of the platform</p>
              </div>
            </div>
          </div>
          <a href="https://calendly.com/vikkash27" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full">Book a Demo Call</Button>
          </a>
        </CardContent>
      </Card>

      {/* Return to Start Button */}
      <Button 
        onClick={handleReturnToStart} 
        className="mt-6 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
      >
        Return to Start
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}