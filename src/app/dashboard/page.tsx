'use client';

import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    // Handle loading state however you like
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    // Although middleware protects this page, 
    // this is an extra check or for components rendered conditionally
    return <div>User not signed in.</div>; 
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.firstName || 'User'}!</p>
      
      {/* Placeholder for ESG Readiness Score */}
      <div>
        <h2>Overall ESG Readiness Score (DSS)</h2>
        <p>[Score Placeholder - e.g., 75%]</p>
      </div>

      {/* Placeholder for Progress Rings/Bars */}
      <div>
        <h2>Progress</h2>
        <p>Environmental: [Progress Bar Placeholder]</p>
        <p>Social: [Progress Bar Placeholder]</p>
        <p>Governance: [Progress Bar Placeholder]</p>
      </div>

      {/* Placeholder for What's Missing */}
      <div>
        <h2>What's Missing</h2>
        <ul>
          <li>[Missing Data Point 1 Placeholder]</li>
          <li>[Missing Data Point 2 Placeholder]</li>
          <li>[Missing Data Point 3 Placeholder]</li>
        </ul>
      </div>

      {/* Placeholder for Call to Action */}
      <div>
        <button>Upload Missing Data</button>
        <button>Improve Your Score</button>
      </div>

      {/* Optional: Last Updated Timestamps */}
      <div>
        <p><small>Environmental Last Updated: [Date Placeholder]</small></p>
        <p><small>Social Last Updated: [Date Placeholder]</small></p>
        <p><small>Governance Last Updated: [Date Placeholder]</small></p>
      </div>
    </div>
  );
}