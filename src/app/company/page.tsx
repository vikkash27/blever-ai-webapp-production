'use client';

import AuthenticatedLayout from "@/components/layouts/AuthenticatedLayout";
import { useOrganization, OrganizationProfile } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { 
  Building, 
  Upload, 
  Edit, 
  MapPin, 
  Users, 
  BarChart3, 
  FileText, 
  Mail, 
  Phone, 
  Globe, 
  Clock, 
  Shield, 
  FileUp, 
  GanttChart, 
  PieChart,
  Download
} from "lucide-react";

// Mock data for company ESG targets
const mockESGTargets = [
  { name: "Carbon Neutral", targetYear: 2030, progress: 35 },
  { name: "Zero Waste to Landfill", targetYear: 2028, progress: 42 },
  { name: "100% Renewable Energy", targetYear: 2035, progress: 28 },
  { name: "Gender Pay Gap Eliminated", targetYear: 2026, progress: 75 }
];

// Mock data for uploaded company documents
const mockDocuments = [
  { name: "Annual Sustainability Report 2024", date: "2024-12-15", type: "PDF", size: "4.2 MB" },
  { name: "ESG Policy Overview", date: "2024-10-22", type: "PDF", size: "1.8 MB" },
  { name: "Corporate Governance Guidelines", date: "2024-08-30", type: "PDF", size: "2.1 MB" }
];

export default function CompanyOverviewPage() {
  const { organization, membership } = useOrganization();
  const [activeTab, setActiveTab] = useState("overview");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const isAdmin = membership?.role === "admin";

  // Handle logo file selection
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!organization) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto py-8 px-4 md:px-8 lg:px-16 flex flex-col items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-md">
            <Building className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">No Organization Found</h1>
            <p className="text-slate-600 mb-6">
              You're not currently part of any organization. Create or join an organization to access company features.
            </p>
            <Button 
              onClick={() => window.open("https://dashboard.clerk.com/", "_blank")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Manage Organizations
            </Button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-6 px-4 md:px-8 space-y-8 max-w-7xl">
        {/* Company Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Company Logo */}
          <div className="mb-4 relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-4 border-white shadow-md">
              {logoPreview ? (
                <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
              ) : (
                <Building className="h-16 w-16 text-slate-400" />
              )}
            </div>
            
            {isAdmin && (
              <div className="absolute bottom-0 right-0">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center shadow-sm">
                    <Edit className="h-4 w-4 text-white" />
                  </div>
                </Label>
                <Input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </div>
            )}
          </div>
          
          {/* Company Name and Basic Info */}
          <h1 className="text-3xl font-bold text-slate-800">{organization.name}</h1>
          <div className="flex items-center justify-center gap-3 mt-2 text-slate-600">
            <MapPin className="h-4 w-4" />
            <span>Location details will appear here</span>
          </div>
        </div>
        
        {/* Main Content Tabs - Updated to restore the full width */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger 
              value="overview" 
              className={`rounded-md py-2 text-sm font-medium transition-all ${
                activeTab === "overview" 
                  ? "bg-white text-slate-800 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <Building className="mr-2 h-4 w-4" /> Company Overview
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className={`rounded-md py-2 text-sm font-medium transition-all ${
                activeTab === "documents" 
                  ? "bg-white text-slate-800 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <FileText className="mr-2 h-4 w-4" /> Company Documents
            </TabsTrigger>
            <TabsTrigger 
              value="esg-targets" 
              className={`rounded-md py-2 text-sm font-medium transition-all ${
                activeTab === "esg-targets" 
                  ? "bg-white text-slate-800 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <GanttChart className="mr-2 h-4 w-4" /> ESG Targets
            </TabsTrigger>
          </TabsList>

          {/* Company Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Company Profile Card */}
              <Card className="md:col-span-2 shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-slate-700" /> 
                    Company Profile
                  </CardTitle>
                  <CardDescription>
                    Basic information about your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAdmin ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company-name">Company Name</Label>
                          <Input id="company-name" defaultValue={organization.name} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company-industry">Industry</Label>
                          <Input id="company-industry" placeholder="e.g. Technology, Manufacturing, etc." />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company-description">Company Description</Label>
                        <textarea 
                          id="company-description" 
                          placeholder="Describe your company, mission and values..."
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company-website">Website</Label>
                          <div className="flex">
                            <div className="flex items-center px-3 bg-slate-100 rounded-l-md border border-r-0 border-input">
                              <Globe className="h-4 w-4 text-slate-500" />
                            </div>
                            <Input id="company-website" placeholder="www.example.com" className="rounded-l-none" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company-size">Company Size</Label>
                          <Input id="company-size" placeholder="e.g. 100-500 employees" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company-founded">Founded Year</Label>
                          <Input id="company-founded" placeholder="e.g. 2010" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company-headquarters">Headquarters</Label>
                          <Input id="company-headquarters" placeholder="e.g. London, UK" />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          Save Company Details
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-slate-600">
                        Your company details will be displayed here once they've been added by an admin.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Company Stats Card */}
              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-slate-700" /> 
                    ESG Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm text-slate-600">Overall ESG Score</Label>
                      <span className="text-xl font-semibold text-emerald-600">78/100</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Environmental</span>
                      <span className="text-sm font-medium text-emerald-600">82/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Social</span>
                      <span className="text-sm font-medium text-blue-600">74/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Governance</span>
                      <span className="text-sm font-medium text-amber-600">79/100</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" className="w-full">
                      <PieChart className="mr-2 h-4 w-4" /> View Detailed Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-slate-700" /> 
                  Primary Contacts
                </CardTitle>
                <CardDescription>
                  Key contacts for ESG reporting and data collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isAdmin ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">ESG Reporting Lead</h3>
                      <div className="space-y-2">
                        <Input placeholder="Full Name" />
                        <div className="flex">
                          <div className="flex items-center px-3 bg-slate-100 rounded-l-md border border-r-0 border-input">
                            <Mail className="h-4 w-4 text-slate-500" />
                          </div>
                          <Input placeholder="Email Address" className="rounded-l-none" />
                        </div>
                        <div className="flex">
                          <div className="flex items-center px-3 bg-slate-100 rounded-l-md border border-r-0 border-input">
                            <Phone className="h-4 w-4 text-slate-500" />
                          </div>
                          <Input placeholder="Phone Number" className="rounded-l-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Sustainability Manager</h3>
                      <div className="space-y-2">
                        <Input placeholder="Full Name" />
                        <div className="flex">
                          <div className="flex items-center px-3 bg-slate-100 rounded-l-md border border-r-0 border-input">
                            <Mail className="h-4 w-4 text-slate-500" />
                          </div>
                          <Input placeholder="Email Address" className="rounded-l-none" />
                        </div>
                        <div className="flex">
                          <div className="flex items-center px-3 bg-slate-100 rounded-l-md border border-r-0 border-input">
                            <Phone className="h-4 w-4 text-slate-500" />
                          </div>
                          <Input placeholder="Phone Number" className="rounded-l-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">CFO/Finance Contact</h3>
                      <div className="space-y-2">
                        <Input placeholder="Full Name" />
                        <div className="flex">
                          <div className="flex items-center px-3 bg-slate-100 rounded-l-md border border-r-0 border-input">
                            <Mail className="h-4 w-4 text-slate-500" />
                          </div>
                          <Input placeholder="Email Address" className="rounded-l-none" />
                        </div>
                        <div className="flex">
                          <div className="flex items-center px-3 bg-slate-100 rounded-l-md border border-r-0 border-input">
                            <Phone className="h-4 w-4 text-slate-500" />
                          </div>
                          <Input placeholder="Phone Number" className="rounded-l-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600">Contact information will appear here once added by an admin.</p>
                )}
              </CardContent>
            </Card>

            {/* Organization Settings (Clerk) */}
            {isAdmin && (
              <Card className="shadow-sm border-slate-200 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-slate-700" /> 
                    Organization Settings
                  </CardTitle>
                  <CardDescription>
                    Manage organization members, roles, and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <OrganizationProfile />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Company Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-slate-700" /> 
                      Company Documents
                    </CardTitle>
                    <CardDescription>
                      Upload and manage key company documents for ESG evaluation
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <FileUp className="mr-2 h-4 w-4" /> Upload Document
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 text-sm">
                      <tr>
                        <th className="py-3 px-4 text-left font-medium text-slate-800">Document Name</th>
                        <th className="py-3 px-4 text-left font-medium text-slate-800">Date Added</th>
                        <th className="py-3 px-4 text-left font-medium text-slate-800">Type</th>
                        <th className="py-3 px-4 text-left font-medium text-slate-800">Size</th>
                        <th className="py-3 px-4 text-right font-medium text-slate-800">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mockDocuments.length > 0 ? (
                        mockDocuments.map((doc, index) => (
                          <tr key={index} className="hover:bg-slate-50 text-sm">
                            <td className="py-3 px-4 text-slate-700">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-slate-500 mr-2" />
                                {doc.name}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-700">{doc.date}</td>
                            <td className="py-3 px-4 text-slate-700">{doc.type}</td>
                            <td className="py-3 px-4 text-slate-700">{doc.size}</td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Download className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-500">
                            No documents have been uploaded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-medium">Document Types to Consider Uploading</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-slate-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Building className="h-3 w-3 text-emerald-600" />
                          </div>
                          Environmental
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="text-sm space-y-1">
                          <li>• Sustainability Reports</li>
                          <li>• Carbon Disclosure Reports</li>
                          <li>• Energy Efficiency Initiatives</li>
                          <li>• Environmental Policies</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-3 w-3 text-blue-600" />
                          </div>
                          Social
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="text-sm space-y-1">
                          <li>• Diversity & Inclusion Policies</li>
                          <li>• Health & Safety Records</li>
                          <li>• Community Engagement Reports</li>
                          <li>• Employee Benefits Documentation</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                            <Shield className="h-3 w-3 text-amber-600" />
                          </div>
                          Governance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="text-sm space-y-1">
                          <li>• Board Structure Documentation</li>
                          <li>• Executive Compensation Policies</li>
                          <li>• Ethical Guidelines & Code of Conduct</li>
                          <li>• Anti-corruption Policies</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ESG Targets Tab */}
          <TabsContent value="esg-targets" className="space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GanttChart className="h-5 w-5 text-slate-700" /> 
                      ESG Targets & Commitments
                    </CardTitle>
                    <CardDescription>
                      Track your organization's ESG goals and progress
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Edit className="mr-2 h-4 w-4" /> Add New Target
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockESGTargets.map((target, index) => (
                    <Card key={index} className="bg-slate-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md">{target.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Target Year: {target.targetYear}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Progress</span>
                            <span className="text-sm font-medium">{target.progress}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ width: `${target.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {isAdmin && (
                  <div className="pt-2">
                    <Card className="border-dashed border-2 border-slate-300 bg-slate-50/50">
                      <CardContent className="flex flex-col items-center justify-center py-6">
                        <p className="text-slate-600 mb-4">Add specific sustainability targets and commitments for your company</p>
                        <Button variant="outline">
                          <Edit className="mr-2 h-4 w-4" /> Define Your ESG Targets
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Industry Benchmarks */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-slate-700" /> 
                  Industry Benchmarks
                </CardTitle>
                <CardDescription>
                  Compare your performance with industry standards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full relative">
                  {/* Placeholder for chart component */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BarChart3 className="h-full w-full text-slate-200" />
                    <span className="absolute text-slate-500">
                      Industry benchmark data will appear here
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}