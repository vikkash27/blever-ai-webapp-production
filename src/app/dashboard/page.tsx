'use client';

import AuthenticatedLayout from "@/components/layouts/AuthenticatedLayout";
import { useUser, useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useApiAuth } from "@/hooks/useApiAuth";
import { AlertCircle, FileText, Loader2, Search, TrendingUp, ArrowRight, Info, CalendarDays, Clock } from "lucide-react";

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

export default function DashboardPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const { isReady, error: authError, get } = useApiAuth();

  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isCompanyProfileComplete, setIsCompanyProfileComplete] = useState(false);
  const [scores, setScores] = useState<EsgScore | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasFetched, setHasFetched] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [scoringStartTime, setScoringStartTime] = useState<string | null>(null);
  
  // For polling when scoring is in progress
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const pollingCount = useRef(0);

  // Set up company profile check
  useEffect(() => {
    if (isUserLoaded && isOrgLoaded) {
      if (!organization) {
        setShouldRedirect(true);
      } else {
        // Load company data from organization metadata
        const metadata = organization.publicMetadata;
        if (metadata.companyData) {
          // Check if essential company info is filled
          const essentialFields = [
            (metadata.companyData as CompanyData).industry,
            (metadata.companyData as CompanyData).size,
            (metadata.companyData as CompanyData).headquarters
          ];
          setIsCompanyProfileComplete(essentialFields.every(field => field && field.trim() !== ''));
        }
      }
    }
  }, [isUserLoaded, isOrgLoaded, organization]);

  // Fetch ESG scores and recommendations from backend
  useEffect(() => {
    async function fetchData() {
      if (!isReady || (hasFetched && !isScoring)) return;
      
      setLoading(true);
      setError("");
      
      try {
        // Fetch ESG scores using the helper
        const scoresData = await get(`http://localhost:3001/api/esg/scores`);
        
        // Check if scoring is in progress (202 status)
        const isInProgress = scoresData?._response?.inProgress || scoresData?.inProgress;
        setIsScoring(!!isInProgress);
        
        if (isInProgress && scoresData?.startedAt) {
          setScoringStartTime(scoresData.startedAt);
        }
        
        setScores(scoresData);
        
        // Fetch recommendations
        const recsData = await get(`http://localhost:3001/api/esg/recommendations`);
        setRecommendations(recsData.recommendations || []);
        
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
        setError(err instanceof Error ? err.message : "Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    
    // Set up polling when scoring is in progress
    if (isScoring && !pollingInterval.current) {
      pollingInterval.current = setInterval(() => {
        pollingCount.current += 1;
        fetchData();
      }, 15000); // Poll every 15 seconds
    }
    
    // Cleanup polling on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, [isReady, get, hasFetched, isScoring]);

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

  if (!isUserLoaded || !isOrgLoaded || shouldRedirect) {
    return (
      <AuthenticatedLayout>
        <div className="p-6">Loading...</div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-6 px-4 md:px-8 space-y-8 max-w-7xl">
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
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                <ArrowRight className="mr-2 h-4 w-4" /> Upload Missing Data
              </Button>
            </Link>
            <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
              <TrendingUp className="mr-2 h-4 w-4" /> Improve Score
            </Button>
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
                <CardDescription>Documents needed to improve your score</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scores.missingData?.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </li>
                  )) || <li className="text-sm text-slate-600">No missing data information available</li>}
                </ul>
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
                <CardDescription>AI-generated suggestions to improve your ESG score</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}