import { users } from '@/drizzle/schemas'
import { formatClerkUser, verifyClerkWebhook } from '@/lib/clerk'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()

    // Use real Clerk webhook signature verification
    const event = verifyClerkWebhook(body, headersList)
    logger.info(`Received Clerk webhook: ${event.type}`)

    // Handle different types of events
    switch (event.type) {
      case 'user.created':
        await handleUserCreated(event.data)
        break

      case 'user.updated':
        await handleUserUpdated(event.data)
        break

      case 'user.deleted':
        await handleUserDeleted(event.data)
        break

      case 'session.created':
        await handleSessionCreated(event.data)
        break

      case 'session.ended':
        await handleSessionEnded(event.data)
        break

      case 'email.created':
        await handleEmailCreated(event.data)
        break

      case 'organization.created':
        await handleOrganizationCreated(event.data)
        break

      case 'organizationMembership.created':
        await handleOrganizationMembershipCreated(event.data)
        break

      case 'organizationMembership.deleted':
        await handleOrganizationMembershipDeleted(event.data)
        break

      default:
        logger.info(`Unhandled Clerk event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Failed to process Clerk webhook:', error as Error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// Handle user creation
async function handleUserCreated(userData: any) {
  try {
    logger.info('Start processing user creation events', {
      userId: userData.id,
    })
    const formattedUser = formatClerkUser(userData)

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, formattedUser.id),
    })

    if (existingUser) {
      logger.info(`User already exists, skipping creation: ${formattedUser.id}`)
      return
    }

    // Create new user
    await db.insert(users).values({
      id: formattedUser.id,
      email: formattedUser.email,
      fullName: formattedUser.fullName,
      avatarUrl: formattedUser.avatarUrl,
      isActive: true,
      isAdmin: formattedUser.isAdmin,
      adminLevel: formattedUser.adminLevel,
      totalUseCases: 0,
      totalTutorials: 0,
      totalBlogs: 0,
      preferences: formattedUser.preferences,
      country: formattedUser.country,
      locale: formattedUser.locale,
      lastLoginAt: formattedUser.lastSignInAt,
      createdAt: formattedUser.createdAt,
      updatedAt: formattedUser.updatedAt,
    })

    logger.info(
      `User created successfully: ${formattedUser.id} (${formattedUser.email})`
    )
  } catch (error) {
    logger.error('Failed to process user.created:', error as Error)
    logger.error('User data: ' + JSON.stringify(userData))
    throw error
  }
}

// Handle user update
async function handleUserUpdated(userData: any) {
  try {
    const formattedUser = formatClerkUser(userData)

    // Update user information
    const result = await db
      .update(users)
      .set({
        email: formattedUser.email,
        fullName: formattedUser.fullName,
        avatarUrl: formattedUser.avatarUrl,
        isActive: true, // Default active status, can be adjusted based on business needs
        isAdmin: formattedUser.isAdmin,
        adminLevel: formattedUser.adminLevel,
        country: formattedUser.country,
        locale: formattedUser.locale,
        updatedAt: new Date(),
      })
      .where(eq(users.id, formattedUser.id))
      .returning()

    if (result.length === 0) {
      // If user does not exist, create new user
      await handleUserCreated(userData)
    } else {
      logger.info(
        `User updated successfully: ${formattedUser.id} (${formattedUser.email})`
      )
    }
  } catch (error) {
    logger.error('Failed to process user.updated:', error as Error)
    throw error
  }
}

// Handle user deletion
async function handleUserDeleted(userData: any) {
  try {
    const userId = userData.id

    // Soft delete user (set to inactive)
    await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    logger.info(`User deletion processed successfully: ${userId}`)
  } catch (error) {
    logger.error('Failed to process user.deleted:', error as Error)
    throw error
  }
}

// Handle session creation (login)
async function handleSessionCreated(sessionData: any) {
  try {
    const userId = sessionData.user_id

    // Update last login time
    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    logger.info(`User login record updated: ${userId}`)
  } catch (error) {
    logger.error('Failed to process session.created:', error as Error)
    // Login record failure should not affect login process, just log the error
  }
}

// Handle session end (logout)
async function handleSessionEnded(sessionData: any) {
  try {
    const userId = sessionData.user_id

    // Here you can add logout-related cleanup logic
    // For example, clearing cache, recording logout time, etc.

    logger.info(`User logout record: ${userId}`)
  } catch (error) {
    logger.error('Failed to process session.ended:', error as Error)
    // Logout record failure should not affect logout process, just log the error
  }
}

// Handle email creation
async function handleEmailCreated(emailData: any) {
  try {
    const userId = emailData.object?.user_id
    const emailAddress = emailData.email_address

    if (userId && emailAddress) {
      // Update user email (if primary email)
      if (emailData.object?.primary) {
        await db
          .update(users)
          .set({
            email: emailAddress,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))

        logger.info(`User primary email updated: ${userId} -> ${emailAddress}`)
      }
    }
  } catch (error) {
    logger.error('Failed to process email.created:', error as Error)
    throw error
  }
}

// Handle organization creation
async function handleOrganizationCreated(orgData: any) {
  try {
    const organizationId = orgData.id
    const name = orgData.name
    const createdBy = orgData.created_by

    // TODO: If organization features are needed, add organization creation logic here
    logger.info(
      `Organization created: ${organizationId} (${name}) by ${createdBy}`
    )
  } catch (error) {
    logger.error('Failed to process organization.created:', error as Error)
    throw error
  }
}

// Handle organization membership creation
async function handleOrganizationMembershipCreated(membershipData: any) {
  try {
    const userId = membershipData.public_user_data?.user_id
    const organizationId = membershipData.organization?.id
    const role = membershipData.role

    // TODO: If organization features are needed, add membership management logic here
    logger.info(
      `Organization member added: ${userId} -> ${organizationId} (${role})`
    )
  } catch (error) {
    logger.error(
      'Failed to process organizationMembership.created:',
      error as Error
    )
    throw error
  }
}

// Handle organization membership deletion
async function handleOrganizationMembershipDeleted(membershipData: any) {
  try {
    const userId = membershipData.public_user_data?.user_id
    const organizationId = membershipData.organization?.id

    // TODO: If organization features are needed, add membership deletion logic here
    logger.info(`Organization member removed: ${userId} -> ${organizationId}`)
  } catch (error) {
    logger.error(
      'Failed to process organizationMembership.deleted:',
      error as Error
    )
    throw error
  }
}
