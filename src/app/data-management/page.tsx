'use client';

import AuthenticatedLayout from "@/components/layouts/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogClose, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useState } from "react";
import { 
  FileUp, 
  FileText, 
  FileSpreadsheet, 
  Search, 
  Check, 
  X, 
  Edit as EditIcon, 
  Trash, 
  Download,
  Filter,
  Eye,
  Save
} from "lucide-react";

// Mock data for extracted fields
const mockExtractedData = [
  { id: 1, category: 'Environmental', field: 'Scope 1 Emissions', value: '150 tCO2e', source: 'Utility Bill Q1', date: '2025-04-01', status: 'OK' },
  { id: 2, category: 'Social', field: 'Employee Turnover Rate', value: '12%', source: 'HR Report 2024', date: '2025-01-15', status: 'OK' },
  { id: 3, category: 'Governance', field: 'Board Gender Diversity', value: '30% Female', source: 'Annual Report 2024', date: '2025-03-10', status: 'OK' },
  { id: 4, category: 'Environmental', field: 'Water Consumption', value: 'Missing', source: '-', date: '-', status: 'Missing' },
  { id: 5, category: 'Governance', field: 'Code of Conduct Update', value: 'Policy v1.2', source: 'Internal Policy Doc', date: '2023-11-20', status: 'Outdated' },
];

// Mock data for extraction feedback
const mockExtractionFeedback = {
  fileName: "Utility Bill Q1 2025.pdf",
  extractedFields: [
    { field: "Scope 1 Emissions", value: "150 tCO2e", confidence: 95 },
    { field: "Reporting Period", value: "Q1 2025", confidence: 98 },
    { field: "Energy Usage (kWh)", value: "12000", confidence: 88 },
  ]
};

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState("upload");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showExtractionFeedback, setShowExtractionFeedback] = useState(false);
  const [editingItem, setEditingItem] = useState<null | {
    id: number;
    category: string;
    field: string;
    value: string;
    source: string;
    date: string;
    status: string;
  }>(null);

  // Filter data based on selected filters
  const filteredData = mockExtractedData.filter(item => {
    const matchesCategory = categoryFilter === "all" || item.category.toLowerCase() === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'ok':
        return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">OK</Badge>;
      case 'missing':
        return <Badge variant="destructive">Missing</Badge>;
      case 'outdated':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">Outdated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handler to start editing an item
  const handleEdit = (item: typeof mockExtractedData[0]) => {
    setEditingItem({...item});
  };

  // Handler to save edited item
  const handleSaveEdit = () => {
    // In a real application, you would update your data source
    console.log("Saving edited item:", editingItem);
    setEditingItem(null);
  };

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-6 px-4 md:px-8 space-y-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">Data Management</h1>
          <div className="flex gap-3">
            <Button variant="outline" className="border-slate-300">
              <Download className="mr-2 h-4 w-4" /> Export Data
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger 
              value="upload" 
              className={activeTab === "upload" ? "bg-slate-800 text-white data-[state=active]:bg-slate-800 data-[state=active]:text-white" : ""}
            >
              <FileUp className="mr-2 h-4 w-4" /> Upload Center
            </TabsTrigger>
            <TabsTrigger 
              value="review" 
              className={activeTab === "review" ? "bg-slate-800 text-white data-[state=active]:bg-slate-800 data-[state=active]:text-white" : ""}
            >
              <Search className="mr-2 h-4 w-4" /> Review Data
            </TabsTrigger>
          </TabsList>

          {/* Upload Center Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>Upload your ESG-related documents here. Supported formats: PDF, CSV, JSON, XLSX.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Drag & Drop Area */}
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-10 text-center cursor-pointer hover:border-slate-400 transition-colors">
                  <FileUp className="mx-auto h-10 w-10 text-slate-400 mb-4" />
                  <p className="text-slate-600">Drag & drop files here, or click below</p>
                  <Input id="file-upload" type="file" className="hidden" multiple />
                  <Button variant="outline" className="mt-4" onClick={() => document.getElementById('file-upload')?.click()}>
                    Browse Files
                  </Button>
                </div>

                {/* Supported Formats Icons */}
                <div className="flex justify-center space-x-8 text-slate-600">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-1 text-red-500" />
                    <span>PDF</span>
                  </div>
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 mr-1 text-green-600" />
                    <span>CSV</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-1 text-blue-500" />
                    <span>JSON</span>
                  </div>
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 mr-1 text-blue-700" />
                    <span>XLSX</span>
                  </div>
                </div>

                {/* Tagging Assistant Input */}
                <div className="space-y-2">
                  <Label htmlFor="file-tag">Tag your upload (optional)</Label>
                  <Input 
                    id="file-tag" 
                    placeholder="e.g., Q1 Utility Bill, Board Charter 2024" 
                    className="max-w-full"
                  />
                  <p className="text-sm text-slate-500">Help us categorize your document faster.</p>
                </div>

                {/* Uploaded Files Section */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Uploaded Files</h3>
                  <div className="border rounded-md px-4 py-3 text-slate-500 text-sm">
                    [List of uploaded files and their processing status will appear here]
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Data Tab */}
          <TabsContent value="review" className="space-y-6">
            {/* Data Table Card */}
            <Card>
              <CardHeader>
                <CardTitle>Data Table View</CardTitle>
                <CardDescription>Review, filter, and manage your extracted ESG data points.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="w-full md:w-64">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2 text-slate-500" />
                          <SelectValue placeholder="All Categories" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="environmental">Environmental</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="governance">Governance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full md:w-64">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2 text-slate-500" />
                          <SelectValue placeholder="Filter by Status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="ok">OK</SelectItem>
                        <SelectItem value="missing">Missing</SelectItem>
                        <SelectItem value="outdated">Outdated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Data Table */}
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Field</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length > 0 ? (
                        filteredData.map((row) => (
                          <TableRow key={row.id} className="hover:bg-slate-50">
                            <TableCell className="font-medium">{row.category}</TableCell>
                            <TableCell>{row.field}</TableCell>
                            <TableCell>{row.value}</TableCell>
                            <TableCell>{row.source}</TableCell>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{getStatusBadge(row.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEdit(row)}
                                  className="h-8 px-2 text-slate-700"
                                >
                                  <EditIcon className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setShowExtractionFeedback(true)}
                                  className="h-8 px-2 text-blue-700"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  className="h-8 px-2"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No results found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Field Dialog */}
      <Dialog open={editingItem !== null} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit ESG Data Field</DialogTitle>
            <DialogDescription>
              Update the information for this data point. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <div className="col-span-3">
                  <Select 
                    value={editingItem.category}
                    onValueChange={(value) => setEditingItem({...editingItem, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Environmental">Environmental</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Governance">Governance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="field" className="text-right">Field</Label>
                <Input
                  id="field"
                  value={editingItem.field}
                  onChange={(e) => setEditingItem({...editingItem, field: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">Value</Label>
                <Input
                  id="value"
                  value={editingItem.value}
                  onChange={(e) => setEditingItem({...editingItem, value: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="source" className="text-right">Source</Label>
                <Input
                  id="source"
                  value={editingItem.source}
                  onChange={(e) => setEditingItem({...editingItem, source: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={editingItem.date}
                  onChange={(e) => setEditingItem({...editingItem, date: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <div className="col-span-3">
                  <Select 
                    value={editingItem.status}
                    onValueChange={(value) => setEditingItem({...editingItem, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="Missing">Missing</SelectItem>
                      <SelectItem value="Outdated">Outdated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-Extraction Feedback Dialog */}
      <Dialog open={showExtractionFeedback} onOpenChange={setShowExtractionFeedback}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-slate-600" />
              Auto-Extraction Feedback
            </DialogTitle>
            <DialogDescription>
              Review AI-extracted data for: <span className="font-medium">{mockExtractionFeedback.fileName}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 my-2">
            {mockExtractionFeedback.extractedFields.map((item, index) => (
              <div key={index} className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">{item.field}</h3>
                    <p className="text-lg">{item.value}</p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      item.confidence >= 90 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      item.confidence >= 80 ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    Confidence: {item.confidence}%
                  </Badge>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700">
                    <Check className="h-4 w-4" /> Confirm
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    <EditIcon className="h-4 w-4" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="h-8 gap-1">
                    <X className="h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" onClick={() => setShowExtractionFeedback(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Check className="mr-2 h-4 w-4" /> Confirm All
              </Button>
              <Button variant="destructive">
                <X className="mr-2 h-4 w-4" /> Reject All
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  );
}