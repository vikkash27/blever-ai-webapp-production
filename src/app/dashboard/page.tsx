'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser, useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { useApiAuth } from "@/hooks/useApiAuth";
import { AlertCircle, FileText, Loader2, TrendingUp, ArrowRight, Info, CalendarDays, Clock, ShieldAlert } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AuthenticatedLayout from "@/components/layouts/AuthenticatedLayout";

// Define score data types
type EsgScore = {
  smeesgScore: number;
  dssScore: number;
  progress: {
    environmental: {
      data: number;
      smeesg: number;
    };
    social: {
      data: number;
      smeesg: number;
    };
    governance: {
      data: number;
      smeesg: number;
    };
  };
  missingData: string[];
  lastUpdated: {
    environmental: string;
    social: string;
    governance: string;
  };
  _response?: {
    status: number;
    inProgress: boolean;
  };
  inProgress?: boolean;
  startedAt?: string;
};

// Define recommendations data types
type Recommendations = {
  byCategory: {
    environmental: string[];
    social: string[];
    governance: string[];
  };
  status: string;
  general: string[];
  lastUpdated: string;
};

// Define company data type
type CompanyData = {
  industry: string;
  size: string;
  description: string;
  website: string;
  foundedYear: string;
  headquarters: string;
  address: string;
  country: string;
  sector: string;
  taxId: string;
}

// Define missing metrics data type
type MissingMetricsData = {
  availableMetrics?: {
    environmental: string[];
    social: string[];
    governance: string[];
  };
  missingMetrics: {
    environmental: string[];
    social: string[];
    governance: string[];
  };
  message?: string;
};

// Define scoring queue status type
type ScoringQueueStatus = {
  organizationId: string;
  currentStatus: {
    isScoring: boolean;
    lastScoredAt: string | null;
    pendingDocuments: number;
  };
  queueStatus: {
    inQueue: boolean;
    queuePosition: number;
    estimatedTimeToProcess: number;
    cooldownRemaining: number;
    isScheduled: boolean;
    scheduledAt: string | null;
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const { isReady, error: authError, get } = useApiAuth();

  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isCompanyProfileComplete, setIsCompanyProfileComplete] = useState(false);
  const [scores, setScores] = useState<EsgScore | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [missingMetrics, setMissingMetrics] = useState<MissingMetricsData | null>(null);
  const [scoringStatus, setScoringStatus] = useState<ScoringQueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasFetched, setHasFetched] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [scoringStartTime, setScoringStartTime] = useState<string | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  
  // For polling when scoring is in progress
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const pollingCount = useRef(0);
  const fetchInProgress = useRef(false);
  const [errorRetryCount, setErrorRetryCount] = useState(0);
  const lastErrorTime = useRef<number | null>(null);

  // Set up company profile check
  useEffect(() => {
    if (isUserLoaded && user && isOrgLoaded && organization) {
      // If user exists but has no organization, redirect to onboarding
      if (!organization) {
        router.push('/onboarding');
        setShouldRedirect(true);
      }
      
      // Check for demo access
      if (user?.publicMetadata?.demo === true) {
        // Demo users have full access
        setHasAccess(true);
        setAccessChecked(true);
      } else {
        // Regular access check
        setHasAccess(true);
        setAccessChecked(true);
      }
    }
  }, [isUserLoaded, user, isOrgLoaded, organization, router, user?.publicMetadata?.demo]);

  // Fetch ESG scores and recommendations from backend with memoized callback
  const fetchData = useCallback(async () => {
    // Prevent multiple concurrent fetch requests
    if (fetchInProgress.current) return;
    if (!isReady || !organization) return;
    
    // If we've already fetched and there's no scoring in progress, don't fetch again
    if (hasFetched && !isScoring && !error) return;
    
    // Implement exponential backoff for errors
    if (errorRetryCount > 0 && lastErrorTime.current) {
      const now = Date.now();
      const timeSinceLastError = now - lastErrorTime.current;
      const retryDelay = Math.min(30000, 1000 * Math.pow(2, errorRetryCount));
      
      if (timeSinceLastError < retryDelay) {
        console.log(`Waiting ${(retryDelay - timeSinceLastError)/1000}s before retry. Attempt: ${errorRetryCount}`);
        return; // Don't retry yet
      }
    }
    
    fetchInProgress.current = true;
    setLoading(true);
    
    try {
      // Fetch ESG scores using the helper
      const response = await get(`http://localhost:3001/api/esg/scores`);
      console.log("Dashboard API response:", response); // Log response for debugging
      
      // Transform API response to match expected EsgScore format
      if (response && response.success === true) {
        console.log("Raw API response data:", response);
        
        // Create a properly formatted EsgScore object from the new API format
        const formattedScores: EsgScore = {
          // Round the values to integers for display
          smeesgScore: Math.round(response.esgScores.overall),
          
          // Data sufficiency is already in percentage for overall
          dssScore: Math.round(response.dataSufficiency.overall * 100),
          
          progress: {
            environmental: {
              // Data sufficiency needs to be multiplied by 100 to get percentage
              data: Math.round(response.dataSufficiency.environmental * 100),
              // ESG scores are already in percentage
              smeesg: Math.round(response.esgScores.environmental),
            },
            social: {
              data: Math.round(response.dataSufficiency.social * 100),
              smeesg: Math.round(response.esgScores.social),
            },
            governance: {
              data: Math.round(response.dataSufficiency.governance * 100),
              smeesg: Math.round(response.esgScores.governance),
            },
          },
          missingData: [], // This field is still missing from the API
          lastUpdated: {
            // Use the single lastUpdated value for all categories
            environmental: response.lastUpdated,
            social: response.lastUpdated,
            governance: response.lastUpdated,
          },
          inProgress: false, // This field is no longer in the API
        };
        
        console.log("Using formatted scores:", formattedScores);
        setScores(formattedScores);
      } else {
        // Handle old response format or errors
        const isInProgress = response?._response?.inProgress || response?.inProgress;
        setIsScoring(!!isInProgress);
        
        if (isInProgress && response?.startedAt) {
          setScoringStartTime(response.startedAt);
        }
        
        if (response && Object.keys(response).length > 0) {
          setScores(response);
        }
      }
      
      // Fetch recommendations
      const recsData = await get(`http://localhost:3001/api/esg/recommendations`);
      
      // Handle the new recommendations structure
      if (recsData.success && recsData.data) {
        setRecommendations(recsData.data);
      } else {
        setRecommendations(null);
      }

      // Fetch missing metrics
      const missingMetricsData = await get(`http://localhost:3001/api/esg/metrics/missing`);
      
      if (missingMetricsData.success) {
        setMissingMetrics(missingMetricsData);
      } else {
        setMissingMetrics(null);
      }
      
      // Fetch scoring queue status
      const scoringQueueData = await get(`http://localhost:3001/api/esg/scoring-queue-status`);
      
      if (scoringQueueData.success) {
        setScoringStatus(scoringQueueData);
      }
      
      // Clear any previous errors and reset retry count
      setError("");
      setErrorRetryCount(0);
      
      // Mark as fetched regardless of whether scoring is in progress
      const isInProgress = response?.inProgress === true;
      if (!isInProgress) {
        setHasFetched(true);
        // Clear any existing polling if scoring is complete
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard data. Please try again later.";
      setError(errorMessage);
      
      // Still mark as fetched even on error to prevent repeated requests
      setHasFetched(true);
      
      // Update error retry count and timestamp
      setErrorRetryCount(prev => prev + 1);
      lastErrorTime.current = Date.now();
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [isReady, organization, organization?.id, get, hasFetched, isScoring, error, errorRetryCount]);

  // Fetch ESG scores and recommendations from backend
  useEffect(() => {
    if (!isReady || !organization) return;
    
    fetchData();
    
    // Set up polling when scoring is in progress
    if (isScoring && !pollingInterval.current) {
      pollingInterval.current = setInterval(() => {
        pollingCount.current += 1;
        fetchData();
      }, 15000); // Poll every 15 seconds
    } else if (!isScoring && pollingInterval.current) {
      // Clean up polling if scoring is not in progress
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
    
    // Cleanup polling on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, [isReady, organization, isScoring, fetchData]);

  // Calculate estimated completion time
  const getEstimatedCompletion = () => {
    if (!scoringStartTime) return 'a few minutes';
    
    const started = new Date(scoringStartTime).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - started) / 60000); // minutes
    
    // ESG scoring typically takes 5-10 minutes
    const estimatedTotal = 10; // minutes
    const remaining = Math.max(1, estimatedTotal - elapsed);
    
    return `approximately ${remaining} minute${remaining !== 1 ? 's' : ''}`;
  };

  // Handle redirect in a separate effect to avoid rendering issues
  useEffect(() => {
    if (shouldRedirect) {
      // Use window.location for a full page navigation instead of React router
      window.location.href = '/demo-request';
    }
  }, [shouldRedirect]);

  // Combine errors
  const displayError = error || authError;

  // Format time remaining helper
  const formatTimeRemaining = (milliseconds: number): string => {
    if (milliseconds <= 0) return 'now';
    
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}${seconds > 0 ? ` ${seconds} second${seconds !== 1 ? 's' : ''}` : ''}`;
    }
    
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  };

  if (!isUserLoaded || !isOrgLoaded || shouldRedirect) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied if the organization doesn't have access
  if (accessChecked && !hasAccess) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen p-4">
        <div className="max-w-md w-full">
          <Alert className="bg-red-50 border-red-200 mb-6">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-700">Access Denied</AlertTitle>
            <AlertDescription className="text-red-600">
              Your organization does not have access to the dashboard. You will be redirected to the organization selection page.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => router.push('/select-organization')} 
            className="w-full"
          >
            Return to Organization Selection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-6 px-4 md:px-8 space-y-8 max-w-7xl">
        {/* Scoring Queue Status Banner */}
        {scoringStatus && (
          <>
            {scoringStatus.currentStatus.isScoring && (
              <div className="bg-blue-50 text-blue-800 p-3 rounded-md border border-blue-200 flex items-center gap-2 mb-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">ESG scoring in progress</span>
              </div>
            )}
            
            {!scoringStatus.currentStatus.isScoring && scoringStatus.queueStatus.isScheduled && scoringStatus.queueStatus.scheduledAt && (
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-md border border-emerald-200 flex items-center gap-2 mb-4">
                <CalendarDays className="h-4 w-4" />
                <span className="text-sm">
                  Next ESG score calculation scheduled for {new Date(scoringStatus.queueStatus.scheduledAt).toLocaleString()}
                </span>
              </div>
            )}
            
            {!scoringStatus.currentStatus.isScoring && !scoringStatus.queueStatus.isScheduled && scoringStatus.queueStatus.inQueue && (
              <div className="bg-amber-50 text-amber-800 p-3 rounded-md border border-amber-200 flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Your organization is in the scoring queue (position {scoringStatus.queueStatus.queuePosition}). 
                  Estimated time to process: {formatTimeRemaining(scoringStatus.queueStatus.estimatedTimeToProcess)}
                </span>
              </div>
            )}
            
            {!scoringStatus.currentStatus.isScoring && !scoringStatus.queueStatus.isScheduled && !scoringStatus.queueStatus.inQueue && scoringStatus.queueStatus.cooldownRemaining > 0 && (
              <div className="bg-slate-50 text-slate-800 p-3 rounded-md border border-slate-200 flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Next ESG score calculation available in {formatTimeRemaining(scoringStatus.queueStatus.cooldownRemaining)}
                </span>
              </div>
            )}
          </>
        )}

        {/* Header Section with Title and CTA Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2 mb-1">
              <TrendingUp className="h-7 w-7 text-emerald-600" /> ESG Dashboard
            </h1>
            <p className="text-slate-600">
              Welcome back, <span className="font-medium">{user?.firstName || 'User'}</span>! Here&apos;s your ESG data readiness summary.
            </p>
          </div>
          <div className="flex gap-3 mt-2 md:mt-0">
            <Link href="/data-management">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
                <ArrowRight className="mr-2 h-4 w-4" /> Upload Missing Data
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Error loading dashboard data</h3>
              <p className="text-sm">{displayError}</p>
            </div>
          </div>
        )}

        {/* Scoring In Progress Message */}
        {!loading && !displayError && isScoring && (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-md border border-amber-200 flex items-start gap-3 mb-4">
            <Clock className="h-5 w-5 mt-0.5 flex-shrink-0 animate-pulse" />
            <div>
              <h3 className="font-medium">ESG Scoring in Progress</h3>
              <p className="text-sm">
                Your documents are currently being processed to calculate your ESG scores.
                This should take {getEstimatedCompletion()} to complete. The page will
                automatically update when scoring is finished.
              </p>
              {scoringStartTime && (
                <p className="text-xs mt-1">
                  Started: {new Date(scoringStartTime).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-slate-600">
              {isScoring 
                ? "Refreshing ESG data - Scoring in progress..." 
                : "Loading your ESG dashboard data..."}
            </p>
            {isScoring && scoringStartTime && (
              <p className="text-sm text-slate-500 mt-2">
                Processing started {new Date(scoringStartTime).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* No Scores Yet State */}
        {!loading && !displayError && !scores && (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="text-center max-w-md">
              <FileText className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-800 mb-2">No ESG Scores Available Yet</h2>
              <p className="text-slate-600 mb-6">
                Your organization doesn't have any ESG scores yet. Upload your documents to get started with your ESG assessment.
              </p>
              <Link href="/data-management">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm w-full">
                  <ArrowRight className="mr-2 h-4 w-4" /> Upload Documents
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !displayError && scores && (
          <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 ${isScoring ? 'opacity-80' : ''}`}>
            {/* Add a semi-transparent overlay when scoring is in progress */}
            {isScoring && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Loader2 className="h-16 w-16 text-emerald-600 animate-spin" />
              </div>
            )}
            
            {/* Left Column - Overall Scores */}
            <div className="md:col-span-4 grid grid-cols-1 gap-6">
              {/* Overall ESG Score - SMEESG */}
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-center text-slate-700">Overall ESG Score</CardTitle>
                  <CardDescription className="text-center">SMEESG</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center pt-4">
                  <div className="relative flex items-center justify-center mb-2">
                    <svg width="150" height="150" className="rotate-[-90deg]">
                      <circle cx="75" cy="75" r="60" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                      <circle
                        cx="75" cy="75" r="60"
                        stroke="#10b981"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={2 * Math.PI * 60 * (1 - (scores.smeesgScore || 0) / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-bold text-slate-800">{scores.smeesgScore || 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Data Sufficiency Score */}
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-center text-slate-700">Overall ESG Readiness</CardTitle>
                  <CardDescription className="text-center">Data Sufficiency Score (DSS)</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center pt-4">
                  <div className="relative flex items-center justify-center mb-2">
                    <svg width="150" height="150" className="rotate-[-90deg]">
                      <circle cx="75" cy="75" r="60" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                      <circle
                        cx="75" cy="75" r="60"
                        stroke="#10b981"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={2 * Math.PI * 60 * (1 - (scores.dssScore || 0) / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-bold text-slate-800">{scores.dssScore || 0}%</span>
                      <span className="text-xs text-slate-500">Complete</span>
                    </div>
                  </div>
                  <span className="text-sm text-slate-600 text-center mt-4">Your overall ESG data completeness</span>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Progress Bars */}
            <div className="md:col-span-8 grid grid-cols-1 gap-4">
              {/* Environmental Progress */}
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="py-3 px-6 flex flex-row items-center justify-between">
                  <CardTitle className="text-md flex items-center gap-2 font-medium">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    Environmental
                  </CardTitle>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays className="h-3 w-3" /> Last Updated: {scores.lastUpdated?.environmental || 'N/A'}
                  </span>
                </CardHeader>
                <CardContent className="px-6 pb-4 pt-0">
                  {/* SMEESG Score */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-600">SMEESG Score</span>
                      <span className="text-xs font-medium">{scores.progress?.environmental?.smeesg || 0}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${scores.progress?.environmental?.smeesg || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Data Sufficiency */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-600">Data Sufficiency</span>
                      <span className="text-xs font-medium">{scores.progress?.environmental?.data || 0}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-400 rounded-full" 
                        style={{ width: `${scores.progress?.environmental?.data || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Progress */}
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="py-3 px-6 flex flex-row items-center justify-between">
                  <CardTitle className="text-md flex items-center gap-2 font-medium">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    Social
                  </CardTitle>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays className="h-3 w-3" /> Last Updated: {scores.lastUpdated?.social || 'N/A'}
                  </span>
                </CardHeader>
                <CardContent className="px-6 pb-4 pt-0">
                  {/* SMEESG Score */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-600">SMEESG Score</span>
                      <span className="text-xs font-medium">{scores.progress?.social?.smeesg || 0}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${scores.progress?.social?.smeesg || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Data Sufficiency */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-600">Data Sufficiency</span>
                      <span className="text-xs font-medium">{scores.progress?.social?.data || 0}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-400 rounded-full" 
                        style={{ width: `${scores.progress?.social?.data || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Governance Progress */}
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="py-3 px-6 flex flex-row items-center justify-between">
                  <CardTitle className="text-md flex items-center gap-2 font-medium">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    Governance
                  </CardTitle>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays className="h-3 w-3" /> Last Updated: {scores.lastUpdated?.governance || 'N/A'}
                  </span>
                </CardHeader>
                <CardContent className="px-6 pb-4 pt-0">
                  {/* SMEESG Score */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-600">SMEESG Score</span>
                      <span className="text-xs font-medium">{scores.progress?.governance?.smeesg || 0}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full" 
                        style={{ width: `${scores.progress?.governance?.smeesg || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Data Sufficiency */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-600">Data Sufficiency</span>
                      <span className="text-xs font-medium">{scores.progress?.governance?.data || 0}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-400 rounded-full" 
                        style={{ width: `${scores.progress?.governance?.data || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Missing Data and Recommendations Section */}
        {!loading && !displayError && scores && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Missing Data */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Missing Data
                </CardTitle>
                <CardDescription>Key metrics needed to improve your ESG score</CardDescription>
              </CardHeader>
              <CardContent>
                {missingMetrics?.message && (
                  <div className="bg-amber-50 p-3 rounded mb-4 text-sm text-amber-800">
                    {missingMetrics.message}
                  </div>
                )}

                {missingMetrics ? (
                  <div className="space-y-4">
                    {/* Environmental Missing Metrics as Accordion */}
                    {missingMetrics.missingMetrics.environmental.length > 0 && (
                      <Accordion type="single" collapsible>
                        <AccordionItem value="environmental">
                          <AccordionTrigger className="py-2 text-sm font-medium text-emerald-700">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                              Environmental <span className="ml-2 text-xs text-slate-500">({missingMetrics.missingMetrics.environmental.length} metrics)</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-1 pl-4 py-2">
                              {missingMetrics.missingMetrics.environmental.map((item, index) => (
                                <li key={index} className="text-sm text-slate-700 list-disc">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {/* Social Missing Metrics as Accordion */}
                    {missingMetrics.missingMetrics.social.length > 0 && (
                      <Accordion type="single" collapsible>
                        <AccordionItem value="social">
                          <AccordionTrigger className="py-2 text-sm font-medium text-blue-700">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                              Social <span className="ml-2 text-xs text-slate-500">({missingMetrics.missingMetrics.social.length} metrics)</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-1 pl-4 py-2">
                              {missingMetrics.missingMetrics.social.map((item, index) => (
                                <li key={index} className="text-sm text-slate-700 list-disc">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {/* Governance Missing Metrics as Accordion */}
                    {missingMetrics.missingMetrics.governance.length > 0 && (
                      <Accordion type="single" collapsible>
                        <AccordionItem value="governance">
                          <AccordionTrigger className="py-2 text-sm font-medium text-purple-700">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                              Governance <span className="ml-2 text-xs text-slate-500">({missingMetrics.missingMetrics.governance.length} metrics)</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-1 pl-4 py-2">
                              {missingMetrics.missingMetrics.governance.map((item, index) => (
                                <li key={index} className="text-sm text-slate-700 list-disc">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">Loading missing metrics information...</p>
                )}

                <div className="mt-4">
                  <Link href="/data-management">
                    <Button variant="outline" size="sm" className="w-full">
                      Upload Documents
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  Recommendations
                </CardTitle>
                <CardDescription>
                  AI-generated suggestions to improve your ESG score
                  {recommendations?.lastUpdated && (
                    <span className="text-xs block mt-1 text-slate-400">
                      Last updated: {new Date(recommendations.lastUpdated).toLocaleString()}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations?.status === "insufficient_data" && (
                  <div className="bg-amber-50 p-2 rounded mb-3 text-xs text-amber-800">
                    <AlertCircle className="inline-block h-3 w-3 mr-1" /> 
                    Insufficient data for complete recommendations
                  </div>
                )}
                
                {/* General Recommendations */}
                {recommendations?.general && recommendations.general.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">General</h4>
                    <ul className="space-y-2">
                      {recommendations.general.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Environmental Recommendations */}
                {recommendations?.byCategory?.environmental && recommendations.byCategory.environmental.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-2 text-emerald-700 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                      Environmental
                    </h4>
                    <ul className="space-y-2 pl-4">
                      {recommendations.byCategory.environmental.map((item, index) => (
                        <li key={index} className="text-sm text-slate-700 list-disc">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Social Recommendations */}
                {recommendations?.byCategory?.social && recommendations.byCategory.social.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-2 text-blue-700 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      Social
                    </h4>
                    <ul className="space-y-2 pl-4">
                      {recommendations.byCategory.social.map((item, index) => (
                        <li key={index} className="text-sm text-slate-700 list-disc">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Governance Recommendations */}
                {recommendations?.byCategory?.governance && recommendations.byCategory.governance.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-2 text-purple-700 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                      Governance
                    </h4>
                    <ul className="space-y-2 pl-4">
                      {recommendations.byCategory.governance.map((item, index) => (
                        <li key={index} className="text-sm text-slate-700 list-disc">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* No recommendations case */}
                {(!recommendations || 
                  (!recommendations.general?.length && 
                   !recommendations.byCategory?.environmental?.length && 
                   !recommendations.byCategory?.social?.length && 
                   !recommendations.byCategory?.governance?.length)) && (
                  <p className="text-sm text-slate-600">No recommendations available at this time.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}