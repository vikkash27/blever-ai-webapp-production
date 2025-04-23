'use client';

import { useUser, useClerk, useOrganization, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ArrowRight, ArrowLeft, Building, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getApiEndpoint } from '@/lib/utils';

const industries = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail" },
  { value: "energy", label: "Energy" },
  { value: "agriculture", label: "Agriculture" },
  { value: "construction", label: "Construction" },
  { value: "transportation", label: "Transportation" },
  { value: "other", label: "Other" }
];

export default function DemoRequestPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { organization } = useOrganization();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    employeeCount: "",
    description: "",
    contactName: "",
    contactEmail: "",
    contactPhone: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isUserLoaded) {
      setLoading(false);
      if (user) {
        setFormData(prev => ({
          ...prev,
          contactName: user.fullName || "",
          contactEmail: user.primaryEmailAddress?.emailAddress || ""
        }));
      }
    }
  }, [isUserLoaded, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignOut = () => {
    signOut(() => {
      window.location.href = "/";
    });
  };

  const nextStep = () => {
    if (step === 1 && (!formData.companyName || !formData.industry)) {
      setError("Company name and industry are required");
      return;
    }
    setError("");
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Get authentication token
      const token = await getToken({ template: 'api_key' });
      
      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      // Submit organization data to your backend
      const response = await fetch(getApiEndpoint("/api/organizations/current"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          organizationId: organization?.id,
          ...formData
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update organization profile");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Failed to submit data. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 relative">
      {/* Return to Homepage button positioned at top left */}
      <div className="absolute top-4 left-4 z-10">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 text-slate-600"
          onClick={handleSignOut}
        >
          <ArrowLeft className="h-4 w-4" /> 
          Return to Homepage
        </Button>
      </div>
      
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-3xl w-full">
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-slate-800">Welcome to BLever.AI</CardTitle>
              <CardDescription className="text-xl mt-2">
                {step === 1 && "Tell us about your organization"}
                {step === 2 && "Contact information"}
                {step === 3 && "Review and submit"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {success ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-medium text-slate-800 mb-2">Organization Profile Created!</h3>
                  <p className="text-slate-600">You'll be redirected to your dashboard in a moment...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                      {error}
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input 
                          id="companyName" 
                          name="companyName" 
                          value={formData.companyName} 
                          onChange={handleChange} 
                          placeholder="Enter your company name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select 
                          value={formData.industry} 
                          onValueChange={(value) => handleSelectChange("industry", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry.value} value={industry.value}>
                                {industry.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="employeeCount">Number of Employees</Label>
                        <Input 
                          id="employeeCount" 
                          name="employeeCount" 
                          value={formData.employeeCount} 
                          onChange={handleChange} 
                          placeholder="e.g. 100-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Company Description</Label>
                        <Textarea 
                          id="description" 
                          name="description" 
                          value={formData.description} 
                          onChange={handleChange} 
                          placeholder="Briefly describe your company and ESG initiatives"
                          rows={4}
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Primary Contact Name</Label>
                        <Input 
                          id="contactName" 
                          name="contactName" 
                          value={formData.contactName} 
                          onChange={handleChange} 
                          placeholder="Full name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input 
                          id="contactEmail" 
                          name="contactEmail" 
                          type="email"
                          value={formData.contactEmail} 
                          onChange={handleChange} 
                          placeholder="email@company.com"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input 
                          id="contactPhone" 
                          name="contactPhone" 
                          value={formData.contactPhone} 
                          onChange={handleChange} 
                          placeholder="e.g. +1 (123) 456-7890"
                        />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h3 className="font-medium text-slate-800 mb-3">Organization Information</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div className="text-slate-500">Company Name:</div>
                          <div className="font-medium">{formData.companyName}</div>
                          
                          <div className="text-slate-500">Industry:</div>
                          <div className="font-medium">{industries.find(i => i.value === formData.industry)?.label || formData.industry}</div>
                          
                          <div className="text-slate-500">Employees:</div>
                          <div className="font-medium">{formData.employeeCount || "Not specified"}</div>
                          
                          <div className="text-slate-500">Description:</div>
                          <div className="font-medium">{formData.description || "Not provided"}</div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h3 className="font-medium text-slate-800 mb-3">Contact Information</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div className="text-slate-500">Name:</div>
                          <div className="font-medium">{formData.contactName}</div>
                          
                          <div className="text-slate-500">Email:</div>
                          <div className="font-medium">{formData.contactEmail}</div>
                          
                          <div className="text-slate-500">Phone:</div>
                          <div className="font-medium">{formData.contactPhone || "Not provided"}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </CardContent>
            
            {!success && (
              <CardFooter className="flex justify-between border-t p-6">
                {step > 1 ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={submitting}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                ) : (
                  <div></div>
                )}
                
                {step < 3 ? (
                  <Button 
                    type="button"
                    onClick={nextStep}
                    disabled={submitting}
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {submitting ? "Submitting..." : "Complete Setup"}
                  </Button>
                )}
              </CardFooter>
            )}
          </Card>

          <p className="text-center text-slate-500 text-sm mt-6">
            Need assistance? Contact us at <Link href="mailto:support@blever.ai" className="text-emerald-600 hover:underline">support@blever.ai</Link>
          </p>
        </div>
      </div>
    </div>
  );
}