'use client';

import AuthenticatedLayout from "@/components/layouts/AuthenticatedLayout";
import { useUser, useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";

import { 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  Info, 
  CalendarDays,
  LineChart,
  PieChart,
  Building2,
  Building,
} from "lucide-react";

// Mock data (replace with actual data fetching later)
const mockData = {
  smeesgScore: 90,
  dssScore: 78,
  progress: {
    environmental: {
      data: 85,
      smeesg: 94
    },
    social: {
      data: 60,
      smeesg: 82
    },
    governance: {
      data: 70,
      smeesg: 88
    },
  },
  missingData: [
    "Latest Waste Management Report (Q1 2025)",
    "Employee Diversity Statistics (2024)",
    "Board Meeting Minutes (Jan 2025)",
  ],
  lastUpdated: {
    environmental: "2025-04-15",
    social: "2025-03-28",
    governance: "2025-04-10",
  },
  environmentalMetrics: {
    energyUsage: [
      { month: "Jan", thisYear: 250, lastYear: 240 },
      { month: "Feb", thisYear: 260, lastYear: 255 },
      { month: "Mar", thisYear: 240, lastYear: 250 },
      { month: "Apr", thisYear: 230, lastYear: 245 },
      { month: "May", thisYear: 220, lastYear: 230 },
      { month: "Jun", thisYear: 210, lastYear: 215 },
      { month: "Jul", thisYear: 200, lastYear: 210 },
      { month: "Aug", thisYear: 190, lastYear: 180 },
      { month: "Sep", thisYear: 185, lastYear: 195 },
      { month: "Oct", thisYear: 200, lastYear: 220 },
      { month: "Nov", thisYear: 220, lastYear: 240 },
      { month: "Dec", thisYear: 230, lastYear: 255 },
    ],
    buildingUsage: [
      { type: "Labs & Studios", percentage: 40 },
      { type: "Residential", percentage: 22 },
      { type: "Library", percentage: 12 },
      { type: "Offices", percentage: 10 },
      { type: "Campus Ops", percentage: 8 },
      { type: "Classrooms", percentage: 5 },
      { type: "Sports", percentage: 3 },
    ]
  },
  pledgeProgress: {
    overall: 35.11,
    areas: [
      { name: "Buildings & Construction", progress: 40 },
      { name: "Co-curricular & Student Engagement", progress: 60 },
      { name: "Community & Corporate Partnerships", progress: 30 },
      { name: "Energy, Carbon & Water", progress: 20 },
      { name: "Sustainable & Fairtrade Food", progress: 55 },
      { name: "Sustainable Science & Green Labs", progress: 25 },
      { name: "Transport", progress: 17 },
      { name: "Waste Management", progress: 22 },
    ]
  }
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

  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  const [isCompanyProfileComplete, setIsCompanyProfileComplete] = useState(false);

  // Safe redirection approach to avoid React errors
  useEffect(() => {
    if (isUserLoaded && isOrgLoaded) {
      if (!organization) {
        // Set state instead of directly calling router.push to avoid React errors
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

  // Handle redirect in a separate effect to avoid rendering issues
  useEffect(() => {
    if (shouldRedirect) {
      // Use window.location for a full page navigation instead of React router
      window.location.href = '/demo-request';
    }
  }, [shouldRedirect]);

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

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
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
                      strokeDashoffset={2 * Math.PI * 60 * (1 - mockData.smeesgScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-bold text-slate-800">{mockData.smeesgScore}%</span>
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
                      strokeDashoffset={2 * Math.PI * 60 * (1 - mockData.dssScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-bold text-slate-800">{mockData.dssScore}%</span>
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
                  <CalendarDays className="h-3 w-3" /> Last Updated: {mockData.lastUpdated.environmental}
                </span>
              </CardHeader>
              <CardContent className="px-6 pb-4 pt-0">
                {/* SMEESG Score */}
                <div className="mb-1 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Score</span>
                  <span className="text-sm font-medium text-emerald-600">{mockData.progress.environmental.smeesg}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${mockData.progress.environmental.smeesg}%` }}
                  ></div>
                </div>
                
                {/* Data Progress */}
                <div className="mb-1 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Progress</span>
                  <span className="text-sm font-medium text-emerald-600">{mockData.progress.environmental.data}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${mockData.progress.environmental.data}%` }}
                  ></div>
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
                  <CalendarDays className="h-3 w-3" /> Last Updated: {mockData.lastUpdated.social}
                </span>
              </CardHeader>
              <CardContent className="px-6 pb-4 pt-0">
                {/* SMEESG Score */}
                <div className="mb-1 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Score</span>
                  <span className="text-sm font-medium text-blue-600">{mockData.progress.social.smeesg}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${mockData.progress.social.smeesg}%` }}
                  ></div>
                </div>
                
                {/* Data Progress */}
                <div className="mb-1 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Progress</span>
                  <span className="text-sm font-medium text-blue-600">{mockData.progress.social.data}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${mockData.progress.social.data}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Governance Progress */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="py-3 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-md flex items-center gap-2 font-medium">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  Governance
                </CardTitle>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <CalendarDays className="h-3 w-3" /> Last Updated: {mockData.lastUpdated.governance}
                </span>
              </CardHeader>
              <CardContent className="px-6 pb-4 pt-0">
                {/* SMEESG Score */}
                <div className="mb-1 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Score</span>
                  <span className="text-sm font-medium text-amber-600">{mockData.progress.governance.smeesg}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${mockData.progress.governance.smeesg}%` }}
                  ></div>
                </div>
                
                {/* Data Progress */}
                <div className="mb-1 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Progress</span>
                  <span className="text-sm font-medium text-amber-600">{mockData.progress.governance.data}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${mockData.progress.governance.data}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What's Missing Section */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="py-4 px-6 flex flex-row items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <CardTitle className="text-lg">What&apos;s Missing?</CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <ul className="space-y-2 mb-4">
              {!isCompanyProfileComplete && (
                <li className="flex items-start gap-2 text-slate-700">
                  <Info className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" /> 
                  Complete your company profile information
                </li>
              )}
              {mockData.missingData.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-700">
                  <Info className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" /> 
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              {!isCompanyProfileComplete && (
                <Link href="/company">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                    <Building className="mr-2 h-4 w-4" /> Complete Company Profile
                  </Button>
                </Link>
              )}
              <Link href="/data-management">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
                  <ArrowRight className="mr-2 h-4 w-4" /> Upload Missing Data
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Metrics Section */}
        <div className="pt-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
            <LineChart className="mr-2 h-5 w-5 text-slate-700" /> Detailed Metrics
          </h2>

          {/* Energy Usage Chart Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-0">
                <CardTitle className="text-md font-medium text-slate-700">Energy usage by month (kBtu)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-64 w-full relative">
                  {/* Placeholder for actual chart component */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LineChart className="h-full w-full text-slate-300" />
                    <span className="absolute text-sm text-slate-500">Energy usage line chart would render here</span>
                  </div>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                    <span className="text-xs text-slate-600">This year</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                    <span className="text-xs text-slate-600">Last year</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-0">
                <CardTitle className="text-md font-medium text-slate-700">Energy usage by building type</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-64 w-full relative">
                  {/* Placeholder for actual chart component */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PieChart className="h-full w-full text-slate-300" />
                    <span className="absolute text-sm text-slate-500">Building usage chart would render here</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                  {mockData.environmentalMetrics.buildingUsage.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">{item.type}</span>
                      <span className="text-xs font-medium text-slate-800">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sustainability Pledges Card */}
          <Card className="shadow-sm border-slate-200 mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium text-slate-700 flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-slate-700" />
                Sustainability pledges for 2030
              </CardTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-800">{mockData.pledgeProgress.overall}%</span>
                <span className="text-sm text-slate-600">Overall progress</span>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                <p className="text-sm text-slate-600 mb-2">Progress in each area</p>
                {mockData.pledgeProgress.areas.map((area, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-700">{area.name}</span>
                      <span className="text-xs font-medium text-slate-800">{area.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-400 rounded-full" 
                        style={{ width: `${area.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </AuthenticatedLayout>
  );
}