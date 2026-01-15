/**
 * 统一认证系统 - 生产级 Better-Auth 实现
 */

// Export from BetterAuthGuard
export {
  AdminGuard,
  AuthGuard,
  SuperAdminGuard,
  ShowForRole,
} from './BetterAuthGuard'

// 新的认证系统组件
export { AuthProvider } from './AuthProvider'
export {
  PermissionProvider,
  PermissionWrapper,
  useHasAllPermissions,
  useHasAnyPermission,
  useHasPermission,
  useIsAdmin,
  usePermissions,
  useUserRole,
} from './PermissionProvider'

// 旧系统已移除，现在完全使用 Better Auth

// Backward compatibility aliases
export { AdminGuard as AdminGuardClient } from './BetterAuthGuard'
export {
  AuthGuard as AuthGuardClient,
  AuthGuard as ProtectedRoute,
} from './BetterAuthGuard'

// 认证表单组件
export { LoginForm } from './LoginForm'
export { ProfileForm } from './ProfileForm'
export { RegisterForm } from './RegisterForm'
// 其他认证组件
export { SignInButton } from './SignInButton'
export { UserProfileClient } from './UserProfileClient'
