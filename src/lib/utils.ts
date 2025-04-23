import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Helper function to get the API URL from environment variables
 * Falls back to http://localhost:3001 if not set
 */
export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

/**
 * Helper function to construct a full API endpoint URL
 * @param path - The API path (should start with /)
 * @returns The full API URL
 */
export function getApiEndpoint(path: string) {
  const baseUrl = getApiUrl();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
