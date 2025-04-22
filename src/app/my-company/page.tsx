'use client';

import { useUser, useOrganization } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Building2, 
  Users, 
  GanttChart, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Globe, 
  FileText,
  AlertCircle,
  Pencil
} from "lucide-react";

// Mock company data - In a real app, this would come from an API or database
const mockCompanyData = {
  name: "GreenTech Solutions",
  industry: "Sustainable Technology",
  size: "Small-Medium Enterprise",
  employees: 98,
  revenue: "$24.5M",
  hq: "Bristol, UK",
  founded: "2012",
  website: "https://www.greentechsolutions.example",
  description: "An innovative technology company dedicated to creating sustainable solutions for businesses while reducing environmental impact.",
  esgReportingFrameworks: [
    "Global Reporting Initiative (GRI)",
    "B Corp Certification",
    "SME Climate Commitment"
  ],
  esgContacts: [
    {
      name: "Sarah Johnson",
      role: "Sustainability Director",
      email: "s.johnson@greentechsolutions.example"
    },
    {
      name: "Mark Phillips",
      role: "ESG Coordinator",
      email: "m.phillips@greentechsolutions.example"
    }
  ],
  reportingPeriods: [
    {
      year: "2024-2025",
      status: "Current",
      startDate: "January 1, 2024",
      endDate: "December 31, 2025"
    },
    {
      year: "2023-2024",
      status: "Completed",
      startDate: "January 1, 2023",
      endDate: "December 31, 2023"
    }
  ],
  carbonTargets: {
    baseline: "2020",
    netZeroTarget: "2035",
    reductionTarget2030: "45% reduction from baseline",
    currentReduction: "18% reduction from baseline"
  },
  certifications: [
    "ISO 14001 (Environmental Management)",
    "B Corporation Certification",
    "Carbon Trust Standard"
  ]
};

export default function MyCompanyPage() {
  const { isLoaded: isUserLoaded } = useUser();
  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const [companyData, setCompanyData] = useState(mockCompanyData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoaded && isOrgLoaded) {
      // In a real application, we would fetch the company data here
      // based on the current organization
      if (organization) {
        console.log("Organization loaded:", organization.name);
        // For now, we'll just use our mock data
        // But in the future, you could do:
        // fetchCompanyData(organization.id).then(data => setCompanyData(data));
        
        // Set company name from the organization if available
        setCompanyData(prevData => ({
          ...prevData,
          name: organization.name
        }));
      }
      setIsLoading(false);
    }
  }, [isUserLoaded, isOrgLoaded, organization]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading company information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-8 space-y-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2 mb-1">
            <Building2 className="h-7 w-7 text-emerald-600" /> My Company
          </h1>
          <p className="text-slate-600">
            Company information and ESG reporting details
          </p>
        </div>
        <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
          <Pencil className="mr-2 h-4 w-4" /> Edit Company Details
        </Button>
      </div>

      {/* Company Overview Section */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            Company Overview
          </CardTitle>
          <CardDescription>General information about your organization</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-500">Company Name</h3>
              <p className="text-lg font-medium text-slate-800">{companyData.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Industry</h3>
              <p className="text-lg font-medium text-slate-800">{companyData.industry}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Description</h3>
              <p className="text-slate-700">{companyData.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <Users className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-slate-500">Employees</h3>
                <p className="text-lg font-medium text-slate-800">{companyData.employees.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <DollarSign className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-slate-500">Annual Revenue</h3>
                <p className="text-lg font-medium text-slate-800">{companyData.revenue}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <GanttChart className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-slate-500">Size</h3>
                <p className="text-lg font-medium text-slate-800">{companyData.size}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-slate-500">Headquarters</h3>
                <p className="text-lg font-medium text-slate-800">{companyData.hq}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-slate-500">Founded</h3>
                <p className="text-lg font-medium text-slate-800">{companyData.founded}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Globe className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-slate-500">Website</h3>
                <a href={companyData.website} target="_blank" rel="noopener noreferrer" 
                  className="text-emerald-600 hover:underline">{companyData.website}</a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ESG Reporting Section */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            ESG Reporting Details
          </CardTitle>
          <CardDescription>Information relevant to ESG and sustainability reporting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-md font-medium text-slate-700 mb-2">Reporting Frameworks</h3>
            <div className="flex flex-wrap gap-2">
              {companyData.esgReportingFrameworks.map((framework, index) => (
                <span key={index} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-sm">
                  {framework}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-slate-700 mb-2">Reporting Periods</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companyData.reportingPeriods.map((period, index) => (
                <Card key={index} className={`border ${period.status === 'Current' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-slate-800">{period.year}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        period.status === 'Current' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {period.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {period.startDate} - {period.endDate}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-slate-700 mb-2">ESG Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companyData.esgContacts.map((contact, index) => (
                <div key={index} className="bg-slate-50 p-4 rounded-md">
                  <h4 className="font-medium text-slate-800">{contact.name}</h4>
                  <p className="text-sm text-slate-600">{contact.role}</p>
                  <a href={`mailto:${contact.email}`} className="text-sm text-emerald-600 hover:underline">
                    {contact.email}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-slate-700 mb-2">Carbon Targets</h3>
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Baseline Year</h4>
                    <p className="font-medium text-slate-800">{companyData.carbonTargets.baseline}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Net Zero Target</h4>
                    <p className="font-medium text-slate-800">{companyData.carbonTargets.netZeroTarget}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">2030 Target</h4>
                    <p className="font-medium text-slate-800">{companyData.carbonTargets.reductionTarget2030}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Current Reduction</h4>
                    <p className="font-medium text-slate-800">{companyData.carbonTargets.currentReduction}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-md font-medium text-slate-700 mb-2">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {companyData.certifications.map((cert, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-5 w-5 text-blue-600" />
        <AlertTitle>Keep your company information up to date</AlertTitle>
        <AlertDescription className="text-blue-700">
          Complete and accurate company information helps improve your ESG reporting process. Make sure to update this information whenever there are changes to your organization.
        </AlertDescription>
      </Alert>
    </div>
  );
}