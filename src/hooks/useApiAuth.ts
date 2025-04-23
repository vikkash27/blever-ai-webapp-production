import { useAuth, useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export function useApiAuth() {
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchToken() {
      try {
        // Standard JWT token, no template needed
        const authToken = await getToken();
        setToken(authToken);
        setError('');
      } catch (err) {
        console.error('Error fetching token:', err);
        setError('Authentication error. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, [getToken]);

  // Create authenticated fetch function
  const authFetch = async (url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    if (!organization?.id) {
      throw new Error('No organization selected');
    }

    // Add organizationId as a query parameter if not already present
    const fetchUrl = new URL(url, window.location.origin);
    if (!fetchUrl.searchParams.has('organizationId')) {
      fetchUrl.searchParams.append('organizationId', organization.id);
    }

    // Add authorization header
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(fetchUrl.toString(), {
      ...options,
      headers
    });

    if (response.status === 401) {
      setError('Your session has expired. Please refresh the page.');
      throw new Error('Authentication failed: Invalid or expired token');
    }

    // Special handling for 403 error - often indicates upload restriction during scoring
    if (response.status === 403) {
      const errorText = await response.text();
      let errorMessage: string;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || 'This operation is currently restricted';
      } catch (e) {
        errorMessage = errorText || 'This operation is currently restricted';
      }
      
      const error = new Error(errorMessage);
      (error as any).status = 403;
      throw error;
    }

    // Special handling for 202 responses - for in-progress operations
    if (response.status === 202) {
      const data = await response.json();
      // Add a flag so consumer can know this is an in-progress operation
      (data as any)._response = { 
        status: 202,
        inProgress: true
      };
      return data;
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || `API error: ${response.status}`;
      } catch (e) {
        errorMessage = errorText || `API error: ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }

    return response;
  };

  return { 
    token, 
    orgId: organization?.id || null, 
    loading, 
    error,
    isReady: !!token && !!organization?.id && !loading,
    authFetch,
    // Convenience methods
    get: async (url: string) => {
      const response = await authFetch(url);
      // Handle regular responses vs 202 in-progress responses
      if (response instanceof Response) {
        return response.json();
      }
      // For 202 responses, the authFetch already returned the parsed JSON with _response metadata
      return response;
    },
    post: async (url: string, data: any) => {
      const response = await authFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    put: async (url: string, data: any) => {
      const response = await authFetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    delete: async (url: string) => {
      const response = await authFetch(url, {
        method: 'DELETE'
      });
      return response.json();
    }
  };
} 