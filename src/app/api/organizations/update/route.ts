import { NextRequest, NextResponse } from "next/server";
import { updateOrganization } from "@/lib/organization";
import { createApiClient } from "@/lib/api";

export async function PUT(request: NextRequest) {
  console.log("API route hit: /api/organizations/update");
  
  try {
    // Get the token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("Missing or invalid Authorization header");
      return NextResponse.json(
        { error: "Unauthorized - Missing valid authentication" },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.substring(7);
    
    // Get the organization ID from the request payload
    const payload = await request.json();
    const orgId = payload.orgId;
    
    if (!orgId) {
      console.log("Missing organization ID in payload");
      
      // Try to get the organization ID from the session cookies as fallback
      const cookieOrgId = request.cookies.get('__clerk_org_id')?.value;
      
      if (!cookieOrgId) {
        return NextResponse.json(
          { error: "Unauthorized - Organization not found" },
          { status: 401 }
        );
      }
      
      console.log("Using orgId from cookie:", cookieOrgId);
      
      // Remove orgId from payload before passing to updateOrganization
      delete payload.orgId;
      const response = await updateOrganization(payload, cookieOrgId);
      console.log("Update successful");
      
      return NextResponse.json(response);
    }
    
    console.log("Using orgId from payload:", orgId);
    
    // Remove orgId from payload before passing to updateOrganization
    delete payload.orgId;
    const response = await updateOrganization(payload, orgId);
    console.log("Update successful");
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating organization details:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update organization" },
      { status: 500 }
    );
  }
} 