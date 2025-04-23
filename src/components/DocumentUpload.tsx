'use client';

import { useState, useRef, useEffect } from 'react';
import { useOrganization, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, AlertCircle, Check, X, Clock, Loader2, FileIcon } from 'lucide-react';
import { getApiEndpoint } from '@/lib/utils';

const documentTypes = [
  { value: 'annual_report', label: 'Annual Report' },
  { value: 'sustainability_report', label: 'Sustainability Report' },
  { value: 'financial_statement', label: 'Financial Statement' },
  { value: 'policy_document', label: 'Policy Document' },
  { value: 'regulatory_filing', label: 'Regulatory Filing' },
  { value: 'impact_report', label: 'Impact Report' },
  { value: 'other', label: 'Other' },
];

export default function DocumentUpload() {
  const { organization } = useOrganization();
  const { getToken } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [scoringInProgress, setScoringInProgress] = useState(false);
  const [scoringStartTime, setScoringStartTime] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch the token when the component mounts
    async function fetchToken() {
      try {
        const sessionToken = await getToken();
        setToken(sessionToken);
      } catch (err) {
        console.error('Error fetching token:', err);
        setErrorMessage('Authentication error. Please try refreshing the page.');
      }
    }

    fetchToken();
  }, [getToken]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!files.length) {
      setErrorMessage('Please select files to upload');
      return;
    }

    if (files.length > 10) {
      setErrorMessage('Maximum 10 documents can be uploaded at once');
      return;
    }

    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setErrorMessage(`Some files exceed the 10MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    if (!organization?.id) {
      setErrorMessage('No organization selected');
      return;
    }

    if (!token) {
      setErrorMessage('Authentication error. Please try refreshing the page.');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(getApiEndpoint(`/api/documents?organizationId=${organization.id}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.status === 403) {
        // Specific handling for when upload is restricted during scoring
        const errorData = await response.json().catch(() => ({}));
        setScoringInProgress(true);
        if (errorData.startedAt) {
          setScoringStartTime(errorData.startedAt);
        }
        throw new Error('Document upload is temporarily disabled while ESG scoring is in progress');
      }

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      setUploadStatus('success');
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  // Calculate estimated completion time (very rough estimation)
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

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>Upload ESG-related documents for automated data extraction</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scoring in progress notice */}
        {scoringInProgress && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4 flex items-start">
            <Clock className="text-amber-500 h-5 w-5 mt-0.5 mr-3 animate-pulse" />
            <div>
              <p className="text-amber-800 font-medium">ESG Scoring in Progress</p>
              <p className="text-amber-700 text-sm">
                Document uploads are temporarily disabled while your documents are being processed. 
                This should take {getEstimatedCompletion()} to complete. 
                Please check back later to see your updated ESG scores.
              </p>
              {scoringStartTime && (
                <p className="text-amber-700 text-xs mt-1">
                  Started: {new Date(scoringStartTime).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4 flex items-start">
            <Check className="text-green-500 h-5 w-5 mt-0.5 mr-3" />
            <div>
              <p className="text-green-800 font-medium">Upload successful!</p>
              <p className="text-green-700 text-sm">Your documents have been uploaded and will be processed.</p>
            </div>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 flex items-start">
            <AlertCircle className="text-red-500 h-5 w-5 mt-0.5 mr-3" />
            <div>
              <p className="text-red-800 font-medium">Upload failed</p>
              <p className="text-red-700 text-sm">{errorMessage || 'There was an error uploading your documents.'}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="file-upload">Upload Files</Label>
          <div className="border-2 border-dashed border-slate-200 rounded-md p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
              accept=".pdf,.csv,.xlsx,.json,.doc,.docx"
            />
            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
            <p className="text-xs text-slate-500 mt-1">PDF, CSV, XLSX, JSON, DOC, DOCX</p>
            <p className="text-xs text-slate-500 mt-1">Maximum 10 files, 10MB per file</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2 mt-4">
            <Label>Selected Files</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                  <div className="flex items-center space-x-2">
                    <FileIcon className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-700 truncate max-w-xs">{file.name}</span>
                    <span className="text-xs text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-emerald-600 hover:bg-emerald-700" 
          onClick={handleUpload}
          disabled={files.length === 0 || uploading || scoringInProgress}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : scoringInProgress ? (
            <>
              <Clock className="mr-2 h-4 w-4" />
              Uploads Disabled During Scoring
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Documents
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 