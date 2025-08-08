import { env } from '@/env'
import { logger } from '@/lib/logger'
import { type WebhookEvent, createClerkClient } from '@clerk/nextjs/server'
import { Webhook } from 'svix'

// Creating a Clerk Client
const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
})

// Clerk webhook signature verification
export function verifyClerkWebhook(
  body: string,
  headers: Headers
): WebhookEvent {
  const webhookSecret = env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error(
      'CLERK_WEBHOOK_SECRET environment variable is not configured'
    )
  }

  // Get Svix signature headers
  const svixId = headers.get('svix-id')
  const svixTimestamp = headers.get('svix-timestamp')
  const svixSignature = headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new Error('Missing Svix signature headers')
  }

  try {
    const webhook = new Webhook(webhookSecret)
    const event = webhook.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent

    return event
  } catch (error) {
    logger.error('Clerk webhook signature verification failed:', error as Error)
    throw new Error('Invalid webhook signature')
  }
}

// Get user information
export async function getClerkUser(userId: string) {
  try {
    const user = await clerkClient.users.getUser(userId)
    return user
  } catch (error) {
    logger.error(`Failed to obtain Clerk user: ${userId}`, error as Error)
    throw error
  }
}

// Update user metadata
export async function updateClerkUserMetadata(
  userId: string,
  metadata: Record<string, any>
) {
  try {
    const user = await clerkClient.users.updateUser(userId, {
      publicMetadata: metadata,
    })

    logger.info(`Successfully updated Clerk user metadata: ${userId}`)
    return user
  } catch (error) {
    logger.error(
      `Failed to update Clerk user metadata: ${userId}`,
      error as Error
    )
    throw error
  }
}

// Delete user
export async function deleteClerkUser(userId: string) {
  try {
    await clerkClient.users.deleteUser(userId)
    logger.info(`Successfully deleted Clerk user: ${userId}`)
  } catch (error) {
    logger.error(`Failed to delete Clerk user: ${userId}`, error as Error)
    throw error
  }
}

// Set user role
export async function setClerkUserRole(userId: string, role: string) {
  try {
    const user = await clerkClient.users.updateUser(userId, {
      publicMetadata: { role },
    })

    logger.info(`Successfully set the Clerk user role: ${userId} -> ${role}`)
    return user
  } catch (error) {
    logger.error(`Failed to set Clerk user role: ${userId}`, error as Error)
    throw error
  }
}

// Batch get users
export async function getClerkUsers(params?: {
  limit?: number
  offset?: number
  emailAddress?: string[]
  userId?: string[]
}) {
  try {
    const users = await clerkClient.users.getUserList({
      limit: params?.limit,
      offset: params?.offset,
      emailAddress: params?.emailAddress,
      userId: params?.userId,
    })

    return users
  } catch (error) {
    logger.error('Failed to batch get Clerk users:', error as Error)
    throw error
  }
}

// Invite user
export async function inviteClerkUser(params: {
  emailAddress: string
  redirectUrl?: string
  publicMetadata?: Record<string, any>
}) {
  try {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: params.emailAddress,
      redirectUrl: params.redirectUrl,
      publicMetadata: params.publicMetadata,
    })

    logger.info(`Successfully invited Clerk user: ${params.emailAddress}`)
    return invitation
  } catch (error) {
    logger.error(
      `Failed to invite Clerk user: ${params.emailAddress}`,
      error as Error
    )
    throw error
  }
}

// Get user sessions
export async function getClerkUserSessions(userId: string) {
  try {
    const sessions = await clerkClient.sessions.getSessionList({
      userId,
    })

    return sessions
  } catch (error) {
    logger.error(`Failed to get Clerk user sessions: ${userId}`, error as Error)
    throw error
  }
}

// Revoke user session
export async function revokeClerkSession(sessionId: string) {
  try {
    await clerkClient.sessions.revokeSession(sessionId)
    logger.info(`Successfully revoked Clerk session: ${sessionId}`)
  } catch (error) {
    logger.error(`Failed to revoke Clerk session: ${sessionId}`, error as Error)
    throw error
  }
}

// Create organization
export async function createClerkOrganization(params: {
  name: string
  slug?: string
  createdBy: string
  publicMetadata?: Record<string, any>
}) {
  try {
    const organization = await clerkClient.organizations.createOrganization({
      name: params.name,
      slug: params.slug,
      createdBy: params.createdBy,
      publicMetadata: params.publicMetadata,
    })

    logger.info(`Successfully created Clerk organization: ${organization.id}`)
    return organization
  } catch (error) {
    logger.error('Failed to create Clerk organization:', error as Error)
    throw error
  }
}

// Get organization members
export async function getClerkOrganizationMembers(organizationId: string) {
  try {
    const members =
      await clerkClient.organizations.getOrganizationMembershipList({
        organizationId,
      })

    return members
  } catch (error) {
    logger.error(
      `Failed to get Clerk organization members: ${organizationId}`,
      error as Error
    )
    throw error
  }
}

// Add organization member
export async function addClerkOrganizationMember(params: {
  organizationId: string
  userId: string
  role: string
}) {
  try {
    const membership =
      await clerkClient.organizations.createOrganizationMembership({
        organizationId: params.organizationId,
        userId: params.userId,
        role: params.role,
      })

    logger.info(
      `Successfully added Clerk organization member: ${params.organizationId} + ${params.userId}`
    )
    return membership
  } catch (error) {
    logger.error('Failed to add Clerk organization member:', error as Error)
    throw error
  }
}

// Remove organization member
export async function removeClerkOrganizationMember(params: {
  organizationId: string
  userId: string
}) {
  try {
    await clerkClient.organizations.deleteOrganizationMembership({
      organizationId: params.organizationId,
      userId: params.userId,
    })

    logger.info(
      `Successfully removed Clerk organization member: ${params.organizationId} - ${params.userId}`
    )
  } catch (error) {
    logger.error('Failed to remove Clerk organization member:', error as Error)
    throw error
  }
}

// Format Clerk user data
export function formatClerkUser(clerkUser: any) {
  try {
    // Safe date parsing function
    const parseDate = (timestamp: any): Date => {
      if (!timestamp) return new Date()

      if (typeof timestamp === 'number') {
        // If it's a timestamp, ensure it's in milliseconds
        const date = new Date(timestamp)
        return isNaN(date.getTime()) ? new Date() : date
      }

      if (typeof timestamp === 'string') {
        const date = new Date(timestamp)
        return isNaN(date.getTime()) ? new Date() : date
      }

      if (timestamp instanceof Date) {
        return isNaN(timestamp.getTime()) ? new Date() : timestamp
      }

      return new Date()
    }

    // Extract basic user information
    const primaryEmail = clerkUser.email_addresses?.find(
      (email: any) => email.id === clerkUser.primary_email_address_id
    )
    const email =
      primaryEmail?.email_address ||
      clerkUser.email_addresses?.[0]?.email_address ||
      ''

    const formattedUser = {
      id: clerkUser.id,
      email: email,
      fullName:
        `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() ||
        null,
      avatarUrl: clerkUser.image_url || clerkUser.profile_image_url || null,
      isActive: true,
      isAdmin: clerkUser.public_metadata?.isAdmin || false,
      adminLevel: clerkUser.public_metadata?.adminLevel || 0,
      preferences: clerkUser.public_metadata?.preferences || {
        theme: 'light',
        language: 'de',
        currency: 'EUR',
        timezone: 'Europe/Berlin',
      },
      country: clerkUser.public_metadata?.country || null,
      locale: clerkUser.public_metadata?.locale || 'de',
      publicMetadata: clerkUser.public_metadata || {},
      privateMetadata: clerkUser.private_metadata || {},
      createdAt: parseDate(clerkUser.created_at),
      updatedAt: parseDate(clerkUser.updated_at),
      lastSignInAt: parseDate(clerkUser.last_sign_in_at),
      lastActiveAt: parseDate(clerkUser.last_active_at),
    }

    // Validate required fields
    if (!formattedUser.id) {
      throw new Error('Clerk user ID is required')
    }

    if (!formattedUser.email) {
      throw new Error('Clerk user email is required')
    }

    return formattedUser
  } catch (error) {
    logger.error('Failed to format Clerk user data:', error as Error)
    logger.error('Original Clerk user data: ' + JSON.stringify(clerkUser))
    throw error
  }
}

// Validate admin permissions
export function isClerkAdmin(user: any): boolean {
  return (
    user?.publicMetadata?.role === 'admin' ||
    user?.publicMetadata?.isAdmin === true ||
    user?.publicMetadata?.adminLevel > 0
  )
}

// Get Clerk user role
export function getClerkUserRole(user: any): string {
  return user?.publicMetadata?.role || 'user'
}

// Get user permissions
export function getClerkUserPermissions(user: any): string[] {
  return user?.publicMetadata?.permissions || []
}
