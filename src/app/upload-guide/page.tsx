'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  FileText, 
  FileSpreadsheet, 
  Droplet, 
  Recycle, 
  Users, 
  ShieldCheck, 
  BookOpen, 
  Scale,
  Building2, 
  FileCheck2, 
  HelpCircle, 
  CalendarDays,
  CheckCircle,
  FileUp,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function UploadGuidePage() {
  return (
    <div className="container mx-auto py-6 px-4 md:px-8 space-y-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2 mb-1">
            <BookOpen className="h-7 w-7 text-emerald-600" /> ESG Upload Guide
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Learn how to efficiently upload and manage your ESG data documents. Follow these guidelines to improve your data completeness score.
          </p>
        </div>
        <div className="flex gap-3 mt-2 md:mt-0">
          <Link href="/data-management">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
              <FileUp className="mr-2 h-4 w-4" /> Upload Documents
            </Button>
          </Link>
        </div>
      </div>

      {/* Steps Card */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-slate-800">Step-by-Step Upload Process</CardTitle>
          <CardDescription>Follow these simple steps to upload your ESG documents</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-slate-50">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-medium text-slate-800 mb-2">1. Prepare Documents</h3>
              <p className="text-sm text-slate-600">
                Collect your ESG documentation across environmental, social, and governance categories. Ensure they are up-to-date and in supported formats (PDF, CSV, XLSX, JSON).
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-slate-50">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <FileUp className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-medium text-slate-800 mb-2">2. Upload to Platform</h3>
              <p className="text-sm text-slate-600">
                Navigate to the Data Management page. Use the &quot;Upload Center&quot; tab to drag & drop your files or browse your computer to select them.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-slate-50">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-medium text-slate-800 mb-2">3. Review & Confirm</h3>
              <p className="text-sm text-slate-600">
                Our AI will extract key ESG data points. Review the extracted information in the &quot;Review Data&quot; tab and confirm or edit as needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Section */}
      <div>
        {/* ESG Categories & Document Examples */}
        <Card className="shadow-sm border-slate-200 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-slate-700" />
              ESG Categories & Document Examples
            </CardTitle>
            <CardDescription>
              Understand which documents to upload for each ESG category
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Accordion type="multiple" className="w-full space-y-4">
              <AccordionItem value="environmental" className="border rounded-lg px-2">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="font-medium text-slate-800">Environmental</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-2">
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium text-slate-800 flex items-center gap-2 mb-2">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
                        Scope 1 & 2 Emissions
                      </h4>
                      <p className="text-sm text-slate-600 mb-2">
                        Upload documents showing your direct and indirect greenhouse gas emissions.
                      </p>
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <p className="text-sm font-medium text-slate-700">Example documents:</p>
                        <ul className="text-sm text-slate-600 mt-1 space-y-1">
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Utility bills (electricity, gas, heating)
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Carbon inventory spreadsheets
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            GHG emissions reports
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium text-slate-800 flex items-center gap-2 mb-2">
                        <Droplet className="h-4 w-4 text-blue-600" />
                        Water Consumption
                      </h4>
                      <p className="text-sm text-slate-600 mb-2">
                        Upload documents showing water usage and conservation efforts.
                      </p>
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <p className="text-sm font-medium text-slate-700">Example documents:</p>
                        <ul className="text-sm text-slate-600 mt-1 space-y-1">
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Water utility bills
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Water consumption reports
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Water conservation policy documents
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium text-slate-800 flex items-center gap-2 mb-2">
                        <Recycle className="h-4 w-4 text-gray-600" />
                        Waste Management
                      </h4>
                      <p className="text-sm text-slate-600 mb-2">
                        Upload documents detailing waste generation, recycling, and disposal practices.
                      </p>
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <p className="text-sm font-medium text-slate-700">Example documents:</p>
                        <ul className="text-sm text-slate-600 mt-1 space-y-1">
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Waste disposal invoices
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Recycling program documentation
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Waste audit reports
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="social" className="border rounded-lg px-2">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-slate-800">Social</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-2">
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium text-slate-800 flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-blue-700" />
                        Employee Diversity
                      </h4>
                      <p className="text-sm text-slate-600 mb-2">
                        Upload documents showing workforce diversity metrics and inclusion initiatives.
                      </p>
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <p className="text-sm font-medium text-slate-700">Example documents:</p>
                        <ul className="text-sm text-slate-600 mt-1 space-y-1">
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            HR diversity reports
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Diversity & inclusion policy documents
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Annual report sections on workforce composition
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium text-slate-800 flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-4 w-4 text-red-600" />
                        Health & Safety
                      </h4>
                      <p className="text-sm text-slate-600 mb-2">
                        Upload documents showing workplace safety practices and incident tracking.
                      </p>
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <p className="text-sm font-medium text-slate-700">Example documents:</p>
                        <ul className="text-sm text-slate-600 mt-1 space-y-1">
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Workplace incident logs
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Safety training records
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Health & safety policy documents
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="governance" className="border rounded-lg px-2">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Scale className="h-4 w-4 text-amber-600" />
                    </div>
                    <span className="font-medium text-slate-800">Governance</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-2">
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium text-slate-800 flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-gray-800" />
                        Board Diversity
                      </h4>
                      <p className="text-sm text-slate-600 mb-2">
                        Upload documents showing board composition and diversity metrics.
                      </p>
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <p className="text-sm font-medium text-slate-700">Example documents:</p>
                        <ul className="text-sm text-slate-600 mt-1 space-y-1">
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Governance policy documents
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Board charter (particularly pages 3-4)
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Annual report sections on board composition
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium text-slate-800 flex items-center gap-2 mb-2">
                        <FileCheck2 className="h-4 w-4 text-indigo-600" />
                        Code of Conduct
                      </h4>
                      <p className="text-sm text-slate-600 mb-2">
                        Upload documents showing ethical guidelines and business practices.
                      </p>
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <p className="text-sm font-medium text-slate-700">Example documents:</p>
                        <ul className="text-sm text-slate-600 mt-1 space-y-1">
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Company code of conduct
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Ethics policy documents
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            Anti-corruption policy documents
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Lower Section - Two Columns: FAQs and Best Practices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - FAQs */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-slate-700" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <Accordion type="multiple" className="w-full space-y-2">
                <AccordionItem value="faq-1" className="border px-4 rounded-lg">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <span className="text-sm font-medium text-slate-800">What if I don&apos;t have all the data?</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 text-sm text-slate-600">
                    Provide what you can. Our platform identifies gaps based on standard ESG frameworks. Your dashboard will highlight key missing areas, and your Data Sufficiency Score (DSS) shows your data completeness. Start with what you have and gradually improve your score.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="faq-2" className="border px-4 rounded-lg">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <span className="text-sm font-medium text-slate-800">What documents can I use?</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 text-sm text-slate-600">
                    Refer to the &quot;ESG Categories&quot; section for specific examples. Common sources include Annual Reports, Sustainability Reports, Utility Bills, HR Records, Policy Documents, Environmental Permits, and Carbon Footprint Reports. If unsure, upload the document and our system will attempt to classify it automatically.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="faq-3" className="border px-4 rounded-lg">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <span className="text-sm font-medium text-slate-800">How is my data protected?</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 text-sm text-slate-600">
                    We take data security seriously. All uploaded documents and extracted data are stored using industry-standard encryption both in transit and at rest. Access is strictly controlled based on user permissions. Our system complies with relevant data protection regulations, including GDPR where applicable.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="faq-4" className="border px-4 rounded-lg">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <span className="text-sm font-medium text-slate-800">Can I update documents later?</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 text-sm text-slate-600">
                    Yes. You can upload updated documents at any time. Our system will flag newer versions and allow you to replace outdated information. This is especially useful for quarterly or annual reporting updates.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Right Column - Best Practices */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-800 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-700" />
                    Data Recency
                  </h4>
                  <p className="text-sm text-slate-600 mt-2">
                    Upload the most recent versions of your documents. Data should ideally be from the current reporting year or the most recent completed fiscal year.
                  </p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-800 flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-slate-700" />
                    Document Quality
                  </h4>
                  <p className="text-sm text-slate-600 mt-2">
                  Ensure uploaded documents are clear and legible. Scanned documents should be high resolution (300 DPI or higher) and text-searchable (OCR&apos;d) if possible.                    </p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-800 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-700" />
                    Preferred Formats
                  </h4>
                  <p className="text-sm text-slate-600 mt-2">
                    While we support PDF, CSV, JSON, and XLSX formats, structured data formats (CSV, XLSX, JSON) enable more accurate and complete data extraction.
                  </p>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-red-500" />
                      <span className="text-slate-700">PDF</span>
                    </div>
                    <div className="flex items-center">
                      <FileSpreadsheet className="h-4 w-4 mr-1 text-green-600" />
                      <span className="text-slate-700">CSV</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-blue-500" />
                      <span className="text-slate-700">JSON</span>
                    </div>
                    <div className="flex items-center">
                      <FileSpreadsheet className="h-4 w-4 mr-1 text-blue-700" />
                      <span className="text-slate-700">XLSX</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-800 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-700" />
                    Processing Time
                  </h4>
                  <p className="text-sm text-slate-600 mt-2">
                    Document processing usually takes 2-5 minutes depending on complexity. You&apos;ll receive a notification when extraction is complete and ready for your review.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}