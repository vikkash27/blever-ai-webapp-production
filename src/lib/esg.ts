import { auth } from "@clerk/nextjs/server";
import { createApiClient } from "./api";

export async function getEsgMetrics() {
  const { orgId } = await auth();
  
  if (!orgId) {
    return { error: "No organization selected", status: 401, metrics: [] };
  }

  try {
    const api = await createApiClient(orgId);
    return await api.esgApi.getMetrics();
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AuthError' || error.message.includes('Authentication failed')) {
        console.error("Authentication error:", error);
        return { error: "Authentication failed", status: 401, metrics: [] };
      }
      // Network errors
      if (error.message.includes('Network error')) {
        return { error: "Could not connect to API", status: 503, metrics: [] };
      }
    }
    // Re-throw unexpected errors
    throw error;
  }
}

export async function createEsgMetric(data: any) {
  const { orgId } = await auth();
  
  if (!orgId) {
    throw new Error("No organization selected");
  }

  try {
    const api = await createApiClient(orgId);
    return await api.esgApi.createMetric(data);
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

export async function updateEsgMetric(id: string, data: any) {
  const { orgId } = await auth();
  
  if (!orgId) {
    throw new Error("No organization selected");
  }

  try {
    const api = await createApiClient(orgId);
    return await api.esgApi.updateMetric(id, data);
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

export async function extractMetricsFromDocument(documentId: string) {
  const { orgId } = await auth();
  
  if (!orgId) {
    throw new Error("No organization selected");
  }

  try {
    const api = await createApiClient(orgId);
    return await api.esgApi.extractFromDocument(documentId);
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

export async function getEsgScores() {
  const { orgId } = await auth();
  
  if (!orgId) {
    return { error: "No organization selected", status: 401, scores: null };
  }

  try {
    const api = await createApiClient(orgId);
    return await api.esgApi.getScores();
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AuthError' || error.message.includes('Authentication failed')) {
        console.error("Authentication error:", error);
        return { error: "Authentication failed", status: 401, scores: null };
      }
      // Network errors
      if (error.message.includes('Network error')) {
        return { error: "Could not connect to API", status: 503, scores: null };
      }
    }
    // Re-throw unexpected errors
    throw error;
  }
}

export async function getEsgRecommendations() {
  const { orgId } = await auth();
  
  if (!orgId) {
    return { error: "No organization selected", status: 401, recommendations: [] };
  }

  try {
    const api = await createApiClient(orgId);
    return await api.esgApi.getRecommendations();
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AuthError' || error.message.includes('Authentication failed')) {
        console.error("Authentication error:", error);
        return { error: "Authentication failed", status: 401, recommendations: [] };
      }
      // Network errors
      if (error.message.includes('Network error')) {
        return { error: "Could not connect to API", status: 503, recommendations: [] };
      }
    }
    // Re-throw unexpected errors
    throw error;
  }
} 