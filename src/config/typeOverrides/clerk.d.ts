import { UserRole } from "@/drizzle/schema"

export { }

declare global {
  interface CustomJwtSessionClaims {
    dbId?: string
    role?: UserRole
  }

  interface UserPublicMetadata {
    dbId?: string
    role?: UserRole
  }
}
