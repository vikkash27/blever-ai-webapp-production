'use client';

import { useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Image from "next/image"; 
import { 
  Building, 
  Edit, 
  MapPin, 
  FileText, 
  GanttChart
} from "lucide-react";

export default function CompanyOverviewPage() {
  const { organization, membership, isLoaded } = useOrganization();
  const [activeTab, setActiveTab] = useState("overview");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const isAdmin = membership?.role === "admin";

  // Form state
  const [companyData] = useState({
    industry: "",
    size: "",
    description: "",
    website: "",
    foundedYear: "",
    headquarters: "",
    address: "",
    country: "",
    sector: "",
    taxId: "",
  });

  // Handle logo file selection
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-8 lg:px-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-md">
          <Building className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">No Organization Found</h1>
          <p className="text-slate-600 mb-6">
            You&apos;re not currently part of any organization. Create or join an organization to access company features.
          </p>
          <Button 
            onClick={() => window.open("https://dashboard.clerk.com/", "_blank")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Manage Organizations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-8 space-y-8 max-w-7xl">
      {/* Company Header Section */}
      <div className="flex flex-col items-center text-center mb-8">
        {/* Company Logo */}
        <div className="mb-4 relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-4 border-white shadow-md">
            {logoPreview ? (
              <div className="relative w-full h-full">
                <Image 
                  src={logoPreview} 
                  alt="Company Logo" 
                  className="object-cover" 
                  fill 
                  sizes="128px"
                />
              </div>
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
          <span>{companyData.headquarters || "Location details will appear here"}</span>
        </div>
      </div>
      
      {/* Main Content Tabs - Updated to match data-management styling */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger 
            value="overview" 
            className={activeTab === "overview" ? "bg-slate-800 text-white data-[state=active]:bg-slate-800 data-[state=active]:text-white" : ""}
          >
            <Building className="mr-2 h-4 w-4" /> Company Overview
          </TabsTrigger>
          <TabsTrigger 
            value="documents" 
            className={activeTab === "documents" ? "bg-slate-800 text-white data-[state=active]:bg-slate-800 data-[state=active]:text-white" : ""}
          >
            <FileText className="mr-2 h-4 w-4" /> Company Documents
          </TabsTrigger>
          <TabsTrigger 
            value="esg-targets" 
            className={activeTab === "esg-targets" ? "bg-slate-800 text-white data-[state=active]:bg-slate-800 data-[state=active]:text-white" : ""}
          >
            <GanttChart className="mr-2 h-4 w-4" /> ESG Targets
          </TabsTrigger>
        </TabsList>

        {/* Company Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* ... existing code ... */}
        </TabsContent>

        {/* Company Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          {/* ... existing code ... */}
        </TabsContent>

        {/* ESG Targets Tab */}
        <TabsContent value="esg-targets" className="space-y-6">
          {/* ... existing code ... */}
        </TabsContent>
      </Tabs>
    </div>
  );
}