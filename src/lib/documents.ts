import { auth } from "@clerk/nextjs/server";
import { createApiClient } from "./api";

export async function getDocuments() {
  const { orgId } = await auth();
  
  if (!orgId) {
    return { error: "No organization selected", status: 401, documents: [] };
  }

  try {
    const api = await createApiClient(orgId);
    return await api.documentApi.list();
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AuthError' || error.message.includes('Authentication failed')) {
        console.error("Authentication error:", error);
        return { error: "Authentication failed", status: 401, documents: [] };
      }
      // Network errors
      if (error.message.includes('Network error')) {
        return { error: "Could not connect to API", status: 503, documents: [] };
      }
    }
    // Re-throw unexpected errors
    throw error;
  }
}

export async function getDocument(id: string) {
  const { orgId } = await auth();
  
  if (!orgId) {
    return { error: "No organization selected", status: 401 };
  }

  try {
    const api = await createApiClient(orgId);
    return await api.documentApi.get(id);
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

export async function uploadDocument(formData: FormData) {
  const { orgId } = await auth();
  
  if (!orgId) {
    throw new Error("No organization selected");
  }

  try {
    const api = await createApiClient(orgId);
    return await api.documentApi.upload(formData);
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

export async function updateDocument(id: string, data: any) {
  const { orgId } = await auth();
  
  if (!orgId) {
    throw new Error("No organization selected");
  }

  try {
    const api = await createApiClient(orgId);
    return await api.documentApi.update(id, data);
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

export async function deleteDocument(id: string) {
  const { orgId } = await auth();
  
  if (!orgId) {
    throw new Error("No organization selected");
  }

  try {
    const api = await createApiClient(orgId);
    return await api.documentApi.delete(id);
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