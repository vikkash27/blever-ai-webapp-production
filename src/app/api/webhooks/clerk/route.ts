import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

// Your database import here
// import { db } from '@/lib/database';

export async function POST(req: Request) {
  console.log('📥 Webhook handler invoked:', new Date().toISOString());
  
  // Get the webhook signing secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('❌ Missing CLERK_WEBHOOK_SECRET env variable');
    return new NextResponse('Missing webhook secret', { status: 400 });
  }

  console.log('✅ CLERK_WEBHOOK_SECRET is defined');

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Missing Svix headers:', { 
      'has-svix-id': !!svix_id, 
      'has-svix-timestamp': !!svix_timestamp, 
      'has-svix-signature': !!svix_signature 
    });
    return new NextResponse('Missing svix headers', { status: 400 });
  }

  console.log('✅ All required Svix headers are present');

  let payload;
  try {
    // Get the body
    payload = await req.json();
    console.log('✅ Request body parsed successfully');
  } catch (error) {
    console.error('❌ Error parsing request body:', error);
    return new NextResponse('Error parsing request body', { status: 400 });
  }
  
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
    console.log('✅ Webhook signature verified successfully');
  } catch (err) {
    console.error('❌ Error verifying webhook signature:', err);
    return new NextResponse('Error verifying webhook', { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log(`📣 Received event type: ${eventType}`);

  if (eventType === 'user.created') {
    // A new user was created
    const { id } = evt.data;
    
    // Create a new user in your database
    try {
      // Example database call - replace with your own implementation
      // await db.user.create({
      //   data: {
      //     clerkId: id,
      //     email: primaryEmail?.email_address || '',
      //     firstName: first_name || '',
      //     lastName: last_name || '',
      //   },
      // });
      
      console.log(`✅ User created in database for Clerk ID: ${id}`);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error(`❌ Error creating user in database for Clerk ID ${id}:`, error);
      return NextResponse.json({ success: false }, { status: 500 });
    }
  }
  
  // Handle organization membership events
  if (eventType === 'organizationMembership.created') {
    console.log('🔍 Processing organizationMembership.created event');
    
    // A user was added to an organization
    const { public_user_data, organization } = evt.data;
    
    // Log the event data for debugging
    console.log('📝 Event data:', JSON.stringify({
      public_user_data: public_user_data || 'undefined',
      organization: organization || 'undefined'
    }, null, 2));
    
    if (!public_user_data || !public_user_data.user_id) {
      console.error('❌ Missing user data in organizationMembership.created event');
      return NextResponse.json({ 
        success: false, 
        message: 'Missing user data in event payload' 
      }, { status: 400 });
    }

    const userId = public_user_data.user_id;
    console.log(`✅ Extracted user ID: ${userId}`);
    
    if (!organization || !organization.id) {
      console.error('❌ Missing organization data in organizationMembership.created event');
      return NextResponse.json({ 
        success: false, 
        message: 'Missing organization data in event payload' 
      }, { status: 400 });
    }

    const orgId = organization.id;
    console.log(`✅ Extracted organization ID: ${orgId}`);
    
    try {
      console.log(`⏳ Initializing Clerk client to update metadata for user: ${userId}`);
      // Initialize Clerk client
      const clerk = await clerkClient();
      
      // Prepare the metadata update
      const metadataUpdate = {
        publicMetadata: {
          hasOrganization: true,
          organizationId: orgId,
          authorized: false // Initially set to false, admin will manually change to true later
        },
      };
      
      console.log(`⏳ Preparing to update user metadata with:`, JSON.stringify(metadataUpdate, null, 2));
      
      // Update user's metadata
      await clerk.users.updateUser(userId, metadataUpdate);
      
      console.log(`✅ Successfully updated user ${userId} metadata - joined org ${orgId}, pending authorization.`);
      
      // Verify the metadata was set correctly by fetching the user
      try {
        const updatedUser = await clerk.users.getUser(userId);
        console.log(`🔍 Verification - User metadata after update:`, JSON.stringify(updatedUser.publicMetadata, null, 2));
        
        // Additional verification
        if (updatedUser.publicMetadata.authorized !== false) {
          console.warn(`⚠️ Verification failed: 'authorized' was not set to false in user metadata`);
        } else {
          console.log(`✅ Verification passed: 'authorized' was properly set to false`);
        }
      } catch (verifyError) {
        console.error(`⚠️ Could not verify metadata update (but update may have succeeded):`, verifyError);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `User ${userId} joined org ${orgId}. Pending authorization.` 
      });
    } catch (error) {
      console.error(`❌ Error updating user ${userId} metadata:`, error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error(`Error name: ${error.name}, message: ${error.message}, stack: ${error.stack}`);
      }
      
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to update user metadata',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }

  // Handle when a user leaves or is removed from an organization
  if (eventType === 'organizationMembership.deleted') {
    console.log('🔍 Processing organizationMembership.deleted event');
    
    const { public_user_data } = evt.data;
    
    // Log the event data for debugging
    console.log('📝 Event data:', JSON.stringify({
      public_user_data: public_user_data || 'undefined'
    }, null, 2));
    
    if (!public_user_data || !public_user_data.user_id) {
      console.error('❌ Missing user data in organizationMembership.deleted event');
      return NextResponse.json({ 
        success: false, 
        message: 'Missing user data in event payload' 
      }, { status: 400 });
    }

    const userId = public_user_data.user_id;
    console.log(`✅ Extracted user ID: ${userId}`);
    
    try {
      console.log(`⏳ Initializing Clerk client for user: ${userId}`);
      // Initialize Clerk client
      const clerk = await clerkClient();
      
      console.log(`⏳ Fetching organization memberships for user: ${userId}`);
      // Get the user's remaining organization memberships
      const memberships = await clerk.users.getOrganizationMembershipList({
        userId: userId
      });
      
      console.log(`✅ User ${userId} has ${memberships.totalCount} remaining organization memberships`);
      
      // If the user still has other organizations, don't change the flag
      if (memberships.totalCount === 0) {
        console.log(`⏳ User ${userId} has no remaining organizations, updating metadata`);
        
        // Prepare the metadata update
        const metadataUpdate = {
          publicMetadata: {
            hasOrganization: false,
            organizationId: null,
            authorized: false // Reset authorization status
          },
        };
        
        console.log(`⏳ Preparing to update user metadata with:`, JSON.stringify(metadataUpdate, null, 2));
        
        // User has no more organizations, update the flag
        await clerk.users.updateUser(userId, metadataUpdate);
        
        console.log(`✅ Successfully updated user ${userId} metadata - marked as having no organization memberships`);
        
        // Verify the metadata was set correctly by fetching the user
        try {
          const updatedUser = await clerk.users.getUser(userId);
          console.log(`🔍 Verification - User metadata after update:`, JSON.stringify(updatedUser.publicMetadata, null, 2));
        } catch (verifyError) {
          console.error(`⚠️ Could not verify metadata update (but update may have succeeded):`, verifyError);
        }
      } else {
        console.log(`ℹ️ User ${userId} still has other organizations, no metadata update needed`);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Successfully processed organization membership deletion for user ${userId}` 
      });
    } catch (error) {
      console.error(`❌ Error updating user ${public_user_data.user_id} metadata for org removal:`, error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error(`Error name: ${error.name}, message: ${error.message}, stack: ${error.stack}`);
      }
      
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to update user metadata for organization removal',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }

  // If we get here, we received an event type we're not specifically handling
  console.log(`ℹ️ Received unhandled event type: ${eventType}. No action taken.`);
  return NextResponse.json({ 
    success: true, 
    message: `Event received but no specific handling for type: ${eventType}` 
  });
}