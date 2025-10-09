export enum AdminLevel {
  USER = 0,
  ADMIN = 1,
  SUPER_ADMIN = 2,
}

export const hasAdminPrivileges = (level?: number | null) =>
  (level ?? AdminLevel.USER) >= AdminLevel.ADMIN

export const hasSuperAdminPrivileges = (level?: number | null) =>
  (level ?? AdminLevel.USER) >= AdminLevel.SUPER_ADMIN
