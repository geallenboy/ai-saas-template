import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

// ===============================
// User Table (Clerk Integration + Admin Permissions)
// ===============================

export const users = pgTable(
  'users',
  {
    // Clerk sync fields
    id: varchar('id', { length: 255 }).primaryKey(), // Clerk User ID
    email: varchar('email', { length: 255 }).notNull().unique(),
    fullName: varchar('full_name', { length: 255 }),
    avatarUrl: text('avatar_url'),

    // Admin permissions
    isAdmin: boolean('is_admin').default(false), // Admin flag
    adminLevel: integer('admin_level').default(0), // Admin level (0=User, 1=Admin, 2=Super Admin)

    // Business fields
    totalUseCases: integer('total_use_cases').default(0), // Total use cases
    totalTutorials: integer('total_tutorials').default(0), // Total tutorials
    totalBlogs: integer('total_blogs').default(0), // Total blogs

    // Status
    isActive: boolean('is_active').default(true),
    lastLoginAt: timestamp('last_login_at'),

    // Preferences
    preferences: jsonb('preferences')
      .$type<{
        theme: 'light' | 'dark'
        language: 'en' | 'de'
        currency: 'USD' | 'EUR'
        timezone: string
      }>()
      .default({
        theme: 'light',
        language: 'en',
        currency: 'USD',
        timezone: 'UTC',
      }),

    // Geographical information
    country: varchar('country', { length: 10 }), // Country code
    locale: varchar('locale', { length: 10 }).default('en'), // Language locale

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    emailIdx: index('users_email_idx').on(table.email),
    isActiveIdx: index('users_is_active_idx').on(table.isActive),
    isAdminIdx: index('users_is_admin_idx').on(table.isAdmin),
    countryIdx: index('users_country_idx').on(table.country),
  })
)

// ===============================
// Type export
// ===============================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// ===============================
// Enum definition
// ===============================

export enum AdminLevel {
  USER = 0,
  ADMIN = 1,
  SUPER_ADMIN = 2,
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum Language {
  EN = 'en',
  DE = 'de',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
}
