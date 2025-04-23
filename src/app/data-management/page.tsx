'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useOrganization, useAuth } from '@clerk/nextjs';
import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout';
import DocumentUpload from '@/components/DocumentUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, FileText, Loader2, Search, Trash2, FileCheck, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { getApiEndpoint } from '@/lib/utils';

// Document type with all the properties
type Document = {
  id?: string;
  _id: string;
  organizationId: string;
  filename: string;
  originalFilename: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  processingStatus: 'completed' | 'processing' | 'failed';
  processingError: string | null;
  createdAt: string;
  updatedAt: string;
  metadata: {
    documentType: string;
    tags: string[];
    topics: string[];
    esgCategories: string[];
    aiConfidence: number;
    estimatedYear?: number;
  };
  // For backward compatibility with UI
  name?: string;
  type?: string;
  uploadedAt?: string;
  size?: number;
  status?: 'processed' | 'processing' | 'failed';
  metrics?: {
    count: number;
    categories: string[];
  };
};

export default function DataManagementPage() {
  const { organization } = useOrganization();
  const { getToken } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [token, setToken] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const fetchInProgress = useRef(false);
  const [errorRetryCount, setErrorRetryCount] = useState(0);
  const lastErrorTime = useRef<number | null>(null);

  useEffect(() => {
    // Fetch the token when the component mounts
    async function fetchToken() {
      try {
        const sessionToken = await getToken();
        setToken(sessionToken);
      } catch (err) {
        console.error('Error fetching token:', err);
        setError('Authentication error. Please try refreshing the page.');
      }
    }

    fetchToken();
  }, [getToken]);

  useEffect(() => {
    if (organization?.id && token && !hasFetched) {
      fetchDocuments();
    }
  }, [organization?.id, token, hasFetched]);

  const fetchDocuments = useCallback(async () => {
    // Prevent multiple concurrent fetch requests
    if (fetchInProgress.current) return;
    if (!organization?.id || !token) return;
    
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
      const response = await fetch(getApiEndpoint(`/api/documents?organizationId=${organization?.id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Transform documents to match our UI expectations
      const transformedDocs = (data.data?.documents || []).map((doc: Document) => ({
        ...doc,
        id: doc._id, // Use _id as id
        name: doc.originalFilename,
        type: doc.metadata?.documentType || 'other',
        uploadedAt: doc.createdAt,
        size: doc.fileSize,
        status: mapProcessingStatus(doc.processingStatus),
        metrics: {
          count: doc.metadata?.topics?.length || 0,
          categories: doc.metadata?.esgCategories || []
        }
      }));
      
      setDocuments(transformedDocs);
      setError(''); // Clear any previous errors
      setErrorRetryCount(0); // Reset retry count on success
      setHasFetched(true); // Mark as fetched to prevent repeated requests
    } catch (err) {
      console.error('Error fetching documents:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load documents. Please try again later.';
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
  }, [organization?.id, token, errorRetryCount]);

  // Add a refresh function that resets hasFetched flag
  const refreshDocuments = () => {
    setHasFetched(false);
    fetchDocuments();
  };

  // Helper to map API status to UI status
  const mapProcessingStatus = (status: string): 'processed' | 'processing' | 'failed' => {
    if (status === 'completed') return 'processed';
    if (status === 'processing') return 'processing';
    return 'failed';
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(getApiEndpoint(`/api/documents/${id}?organizationId=${organization?.id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      // Remove the document from the state
      setDocuments(prevDocs => prevDocs.filter(doc => doc._id !== id && doc.id !== id));
      
      // Refresh the document list
      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleExtractMetrics = async (id: string) => {
    try {
      const response = await fetch(getApiEndpoint(`/api/esg/documents/${id}/extract?organizationId=${organization?.id}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract metrics');
      }
      
      // Refresh documents list to show updated status
      fetchDocuments();
    } catch (err) {
      console.error('Error extracting metrics:', err);
      alert('Failed to extract metrics. Please try again.');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    // Filter by search query
    const matchesSearch = doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         doc.type?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by tab
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'processed') return matchesSearch && doc.status === 'processed';
    if (activeTab === 'processing') return matchesSearch && doc.status === 'processing';
    if (activeTab === 'failed') return matchesSearch && doc.status === 'failed';
    
    return matchesSearch;
  });

  const getDocumentTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      'environmental_report': 'Environmental Report',
      'sustainability_report': 'Sustainability Report',
      'governance_document': 'Governance Document',
      'social_impact_report': 'Social Impact Report',
      'financial_statement': 'Financial Statement',
      'other': 'Other',
    };
    
    return typeMap[type] || type;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-6 px-4 md:px-8 space-y-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2 mb-1">
              <FileText className="h-7 w-7 text-emerald-600" /> Document Management
            </h1>
            <p className="text-slate-600">
              Upload and manage your ESG-related documents
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1 upload-section">
            <DocumentUpload />
          </div>

          {/* Documents List Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Your Documents</CardTitle>
                <CardDescription>Manage and process your uploaded documents</CardDescription>
                
                <div className="mt-4 flex items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      type="search"
                      placeholder="Search documents..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2"
                    onClick={refreshDocuments}
                  >
                    Refresh
                  </Button>
                </div>
                
                <Tabs className="mt-4" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="processed">Processed</TabsTrigger>
                    <TabsTrigger value="processing">Processing</TabsTrigger>
                    <TabsTrigger value="failed">Failed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <CardContent>
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-16 w-16 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">No documents found</h3>
                    {searchQuery ? (
                      <p className="text-slate-500 mb-6">No documents matching your search criteria</p>
                    ) : (
                      <>
                        <p className="text-slate-500 mb-2">You haven't uploaded any documents yet</p>
                        <p className="text-slate-500 mb-6">Upload ESG-related documents to get insights and improve your score</p>
                        {activeTab === 'all' && (
                          <div className="flex items-center justify-center gap-4">
                            <Button 
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => document.querySelector('.upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                              <Upload className="mr-2 h-4 w-4" /> Upload your first document
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-3 font-medium text-slate-500">Document</th>
                          <th className="pb-3 font-medium text-slate-500">Type</th>
                          <th className="pb-3 font-medium text-slate-500">Uploaded</th>
                          <th className="pb-3 font-medium text-slate-500">Status</th>
                          <th className="pb-3 font-medium text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredDocuments.map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-50">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-slate-400" />
                                <span className="font-medium text-slate-700">{doc.name}</span>
                                <span className="text-xs text-slate-500">({formatSize(doc.size || 0)})</span>
                              </div>
                            </td>
                            <td className="py-3 text-slate-600">{getDocumentTypeLabel(doc.type || 'other')}</td>
                            <td className="py-3 text-slate-600">{formatDate(doc.uploadedAt || '')}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-1.5">
                                {doc.status === 'processed' && (
                                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                    <FileCheck className="mr-1 h-3 w-3" /> 
                                    Processed
                                    {doc.metrics && (
                                      <span className="ml-1">({doc.metrics.count})</span>
                                    )}
                                  </span>
                                )}
                                {doc.status === 'processing' && (
                                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" /> 
                                    Processing
                                  </span>
                                )}
                                {doc.status === 'failed' && (
                                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                                    <AlertCircle className="mr-1 h-3 w-3" /> 
                                    Failed
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleDeleteDocument(doc._id || '')}
                                >
                                  <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-500" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}