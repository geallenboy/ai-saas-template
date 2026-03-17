/**
 * 统一认证系统 - 生产级 Better-Auth 实现
 */

// 新的认证系统组件
export { AuthProvider } from './AuthProvider'
// Export from BetterAuthGuard
export {
  AdminGuard,
  AuthGuard,
  ShowForRole,
  SuperAdminGuard,
} from './BetterAuthGuard'
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
export {
  AdminGuard as AdminGuardClient,
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
