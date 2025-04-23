import { WebhookEvent } from "@clerk/nextjs/server";

// Get the webhook secret from environment variables
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || '';
const BACKEND_API_KEY = process.env.BACKEND_API_KEY || '';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const evt = payload as WebhookEvent;
    const eventType = evt.type;

    if (eventType === "organization.created" || eventType === "organization.updated") {
      // Extract organization data from the event
      const orgData = {
        id: evt.data.id,
        name: evt.data.name,
        // Add any other fields needed by your backend
      };

      // Send to your backend API with authentication
      const response = await fetch("http://localhost:3001/api/organizations/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${BACKEND_API_KEY}`
        },
        body: JSON.stringify(orgData),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync organization: ${response.statusText}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
      });
    }

    // Return a 200 response for all other event types
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ success: false, error: "Failed to process webhook" }), {
      status: 500,
    });
  }
} 