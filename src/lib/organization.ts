import { auth } from "@clerk/nextjs/server";
import { createApiClient } from "./api";

export async function getCurrentOrganization() {
  const { orgId } = await auth();
  
  if (!orgId) {
    return { error: "No organization selected", status: 401 };
  }

  try {
    const api = await createApiClient(orgId);
    return await api.organizationApi.getCurrent();
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AuthError' || error.message.includes('Authentication failed')) {
        console.error("Authentication error:", error);
        return { error: "Authentication failed", status: 401 };
      }
      // Network errors
      if (error.message.includes('Network error')) {
        return { error: "Could not connect to API", status: 503 };
      }
    }
    // Re-throw unexpected errors
    throw error;
  }
}

export async function getOrganizationStats() {
  const { orgId } = await auth();
  
  if (!orgId) {
    return { error: "No organization selected", status: 401 };
  }

  try {
    const api = await createApiClient(orgId);
    return await api.organizationApi.getStats();
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AuthError' || error.message.includes('Authentication failed')) {
        console.error("Authentication error:", error);
        return { error: "Authentication failed", status: 401 };
      }
      // Network errors
      if (error.message.includes('Network error')) {
        return { error: "Could not connect to API", status: 503 };
      }
    }
    // Re-throw unexpected errors
    throw error;
  }
}

export async function updateOrganization(data: any, providedOrgId?: string, authToken?: string) {
  let orgId = providedOrgId;
  
  if (!orgId) {
    try {
      const authSession = await auth();
      orgId = authSession.orgId || undefined;
    } catch (authError) {
      console.error("Auth error in updateOrganization:", authError);
      throw new Error("Authentication failed: Unable to verify credentials");
    }
  }
  
  if (!orgId) {
    throw new Error("No organization selected");
  }

  try {
    const api = await createApiClient(orgId, authToken);
    return await api.organizationApi.updateCurrent(data);
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AuthError' || error.message.includes('Authentication failed')) {
        console.error("Authentication error:", error);
        throw new Error("Authentication failed: Invalid or expired token");
      }
      // Network errors
      if (error.message.includes('Network error')) {
        throw new Error("Could not connect to API. Please check your connection.");
      }
    }
    // Re-throw the error
    throw error;
  }
} 