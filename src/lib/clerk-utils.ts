import { currentUser } from "@clerk/nextjs/server";

// Define a type for organization memberships to avoid TypeScript errors
interface OrganizationMembership {
  id: string;
  organization: {
    id: string;
    name: string;
    slug?: string;
    publicMetadata?: Record<string, unknown>;
  };
  role: string;
}

// Define a extended User type to include organizationMemberships
interface ExtendedUser {
  id: string;
  organizationMemberships?: OrganizationMembership[];
  [key: string]: unknown;
}

/**
 * Checks if the current user belongs to any organizations
 * This can be used in server components or API routes
 */
export async function checkUserOrganizations() {
  try {
    // Get the current user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return { hasOrganization: false };
    }
    
    // Safely access organizationMemberships with type assertion
    const extendedUser = user as unknown as ExtendedUser;
    const memberships = extendedUser.organizationMemberships;
    
    // Check if user has an active organization
    const activeOrgId = memberships?.[0]?.organization.id || null;
    
    return {
      hasOrganization: !!memberships && memberships.length > 0,
      activeOrgId,
      organizationCount: memberships?.length || 0
    };
  } catch (error) {
    console.error("Error checking user organizations:", error);
    return { hasOrganization: false, error };
  }
}

/**
 * Checks if an organization has access permission based on its public metadata
 * @param orgId The organization ID to check
 * @returns Boolean indicating if the organization has access
 */
export async function checkOrganizationAccess(orgId: string | null): Promise<boolean> {
  if (!orgId) return false;
  
  try {
    // Get the current user from Clerk
    const user = await currentUser();
    
    if (!user) return false;
    
    // Find the organization membership for the given org ID
    const orgMembership = (user as unknown as ExtendedUser).organizationMemberships?.find(
      (membership) => membership.organization.id === orgId
    );
    
    if (!orgMembership) return false;
    
    // Access the organization's public metadata
    const publicMetadata = orgMembership.organization.publicMetadata || {};
    
    // Handle different ways the access value could be stored
    let accessValue = publicMetadata.access;
    
    // If access is stored as a JSON string, parse it
    if (typeof accessValue === 'string' && (accessValue.toLowerCase() === 'true' || accessValue.toLowerCase() === 'false')) {
      accessValue = accessValue.toLowerCase() === 'true';
    }
    
    // Check for boolean true or string "true" (case insensitive)
    const hasAccessPermission = accessValue === true || 
      (typeof accessValue === 'string' && accessValue.toLowerCase() === 'true');
    
    return hasAccessPermission;
  } catch (error) {
    console.error("Error checking organization access:", error);
    return false;
  }
}