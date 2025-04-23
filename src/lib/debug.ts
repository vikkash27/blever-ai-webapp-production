import { auth } from "@clerk/nextjs/server";
import { createApiClient } from "./api";

export async function debugAuth() {
  const { orgId, userId } = await auth();
  
  if (!orgId) {
    return { error: "No organization selected", userId };
  }

  const api = await createApiClient(orgId);
  
  try {
    // Call your debug endpoint
    const response = await fetch(`http://localhost:3001/api/debug/auth?organizationId=${orgId}`, {
      headers: {
        'Authorization': `Bearer ${await (await auth()).getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Auth debugging failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Auth debugging error:", error);
    return { 
      error: "Failed to debug authentication", 
      details: error instanceof Error ? error.message : String(error),
      userId,
      orgId 
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