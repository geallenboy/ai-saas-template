import { pgEnum, pgTable, text, integer } from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../schemaHelpers"



export const userRoles = ["user", "admin"] as const
export type UserRole = (typeof userRoles)[number]
export const userRoleEnum = pgEnum("user_role", userRoles)

export const UserTable = pgTable("users", {
  id,
  clerkUserId: text().notNull().unique(),
  email: text().notNull(),
  name: text().notNull(),
  role: userRoleEnum().notNull().default("user"),
  imageUrl: text(),
  credits: integer().notNull().default(5),
  createdAt,
  updatedAt,
})
// Export types
export type User = typeof UserTable.$inferSelect
