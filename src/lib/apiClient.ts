import { auth } from "@clerk/nextjs/server";

// Define error types for consistent handling
export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

// API base URL - centralized for easy configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

// Fetch options with custom headers
type FetchOptions = RequestInit & {
  appendOrgId?: boolean;
  throwAuthError?: boolean;
};

/**
 * Creates a fetch request with proper authentication and error handling
 */
export async function apiFetch<T>(
  endpoint: string, 
  options: FetchOptions = {}
): Promise<T> {
  try {
    // Get the current session and organization
    const session = await auth();
    const { userId } = session;
    
    if (!userId) {
      const error: ApiError = {
        status: 401,
        message: "Authentication required. Please sign in to continue."
      };
      throw error;
    }
    
    // Get token for API authentication
    const token = await session.getToken();
    if (!token) {
      const error: ApiError = {
        status: 401,
        message: "Failed to authenticate. Please try signing in again."
      };
      throw error;
    }
    
    // Default headers with authentication
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');
    
    // Prepare URL - handle relative or full URLs
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    // Make the actual request
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Handle 202 (Accepted) responses - in-progress operations
    if (response.status === 202) {
      const data = await response.json();
      
      // Add metadata to indicate this is an in-progress operation
      (data as any).inProgress = true;
      
      // The API might return a startedAt timestamp
      if (!data.startedAt && response.headers.get('X-Process-Started-At')) {
        (data as any).startedAt = response.headers.get('X-Process-Started-At');
      }
      
      return data as T;
    }
    
    // Handle non-2xx responses
    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: "An unexpected error occurred" };
      }
      
      const error: ApiError = {
        status: response.status,
        message: errorData.message || `API error: ${response.statusText}`,
        details: errorData
      };
      
      // Special handling for specific error codes
      if (response.status === 401) {
        error.message = "Authentication failed. Please sign in again.";
      } else if (response.status === 403) {
        // Check if this is a document upload restriction during scoring
        if (endpoint.includes('/documents') && errorData.reason === 'scoring_in_progress') {
          error.message = "Document uploads are temporarily disabled while ESG scoring is in progress.";
          (error as any).scoringInProgress = true;
          (error as any).startedAt = errorData.startedAt;
        } else {
          error.message = "You don't have permission to perform this action.";
        }
      }
      
      throw error;
    }
    
    // Parse successful response
    const data = await response.json();
    return data as T;
  } catch (error) {
    // Enhance error with details if needed
    if (error instanceof Error && !(error as any).status) {
      const apiError: ApiError = {
        status: 0, // Network or other errors
        message: error.message || "Network error occurred",
        details: error
      };
      throw apiError;
    }
    throw error;
  }
}

/**
 * Server-side API client with utility methods
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: FetchOptions) => 
    apiFetch<T>(endpoint, { method: 'GET', ...options }),
    
  post: <T>(endpoint: string, data: any, options?: FetchOptions) => 
    apiFetch<T>(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(data),
      ...options 
    }),
    
  put: <T>(endpoint: string, data: any, options?: FetchOptions) => 
    apiFetch<T>(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(data),
      ...options 
    }),
    
  delete: <T>(endpoint: string, options?: FetchOptions) => 
    apiFetch<T>(endpoint, { method: 'DELETE', ...options }),
}; 