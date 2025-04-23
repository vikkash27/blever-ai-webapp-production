import { auth } from "@clerk/nextjs/server";
import { createApiClient } from "./api";
import { getApiEndpoint } from '@/lib/utils';

export async function debugAuth() {
  try {
    // Get the current auth
    const session = await auth();
    const orgId = session.orgId;
    
    // Don't proceed if we don't have an organization
    if (!orgId) {
      return {
        success: false,
        message: "No organization selected"
      };
    }
    
    try {
      // Call your debug endpoint
      const response = await fetch(getApiEndpoint(`/api/debug/auth?organizationId=${orgId}`), {
        headers: {
          'Authorization': `Bearer ${await session.getToken()}`
        }
      });
      
      const data = await response.json();
      
      return {
        success: response.ok,
        data
      };
    } catch (error) {
      console.error("API error:", error);
      return {
        success: false,
        message: "API Error"
      };
    }
  } catch (error) {
    console.error("Auth error:", error);
    return {
      success: false,
      message: "Auth Error"
    };
  }
}

// Function to check if there are authentication issues
export async function checkAuthStatus() {
  try {
    const { orgId } = await auth();
    
    if (!orgId) {
      return { 
        status: 'error',
        issue: 'no_organization',
        message: 'No organization selected'
      };
    }
    
    const token = await (await auth()).getToken();
    
    if (!token) {
      return {
        status: 'error',
        issue: 'no_token',
        message: 'No authentication token available'
      };
    }
    
    return {
      status: 'ok',
      orgId,
      tokenAvailable: true
    };
  } catch (error) {
    return {
      status: 'error',
      issue: 'auth_error',
      message: error instanceof Error ? error.message : 'Unknown authentication error'
    };
  }
}

export async function testServerAuth(orgId: string, token: string) {
  try {
    const response = await fetch(getApiEndpoint(`/api/debug/auth?organizationId=${orgId}`), {
      // ... rest of the fetch parameters ...
    });
    // ... rest of the function ...
  } catch (error) {
    // ... error handling ...
  }
} 