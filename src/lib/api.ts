import { auth } from "@clerk/nextjs/server";
import { getApiUrl } from './utils';

const API_BASE_URL = getApiUrl();

type APIOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  multipart?: boolean;
};

interface AuthError extends Error {
  name: string;
}

export const createApiClient = async (orgId: string | null, authToken?: string) => {
  let token: string | undefined = authToken;
  
  // Only use auth() if no token was provided (server-side only)
  if (!token) {
    try {
      const { getToken } = await auth();
      token = await getToken();
    } catch (error) {
      console.error("Auth error in createApiClient:", error);
    }
  }

  const apiFetch = async (endpoint: string, options: APIOptions = {}) => {
    const { method = 'GET', body, headers = {}, multipart = false } = options;

    if (!orgId) {
      throw new Error('No organization selected');
    }

    const url = new URL(`${API_BASE_URL}${endpoint}`);
    url.searchParams.append('organizationId', orgId);

    const requestHeaders: Record<string, string> = {
      ...headers,
    };
    
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    if (!multipart && body) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include',
    };

    if (body) {
      if (multipart) {
        requestOptions.body = body;
      } else {
        requestOptions.body = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(url.toString(), requestOptions);

      if (response.status === 401) {
        const error = new Error('Authentication failed: Invalid or expired token') as AuthError;
        error.name = 'AuthError';
        throw error;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      return response.json();
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'AuthError') {
          throw error;
        }
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          throw new Error(`Network error: Could not connect to API. Please check your connection.`);
        }
      }
      
      throw error;
    }
  };

  // Organization API
  const organizationApi = {
    getCurrent: () => apiFetch('/api/organizations/current'),
    updateCurrent: (data: any) => apiFetch('/api/organizations/current', { method: 'PUT', body: data }),
    getStats: () => apiFetch('/api/organizations/current/stats'),
  };

  // Document API
  const documentApi = {
    list: (params = {}) => apiFetch('/api/documents'),
    get: (id: string) => apiFetch(`/api/documents/${id}`),
    upload: (formData: FormData) => apiFetch('/api/documents', { method: 'POST', body: formData, multipart: true }),
    update: (id: string, data: any) => apiFetch(`/api/documents/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => apiFetch(`/api/documents/${id}`, { method: 'DELETE' }),
  };

  // ESG API
  const esgApi = {
    getMetrics: () => apiFetch('/api/esg/metrics'),
    createMetric: (data: any) => apiFetch('/api/esg/metrics', { method: 'POST', body: data }),
    updateMetric: (id: string, data: any) => apiFetch(`/api/esg/metrics/${id}`, { method: 'PUT', body: data }),
    extractFromDocument: (documentId: string) => apiFetch(`/api/esg/documents/${documentId}/extract`, { method: 'POST' }),
    getScores: () => apiFetch('/api/esg/scores'),
    getRecommendations: () => apiFetch('/api/esg/recommendations'),
  };

  return {
    organizationApi,
    documentApi,
    esgApi
  };
}; 