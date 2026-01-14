/**
 * 统一认证系统 - 生产级 Better-Auth 实现
 */

export { AdminGuard } from './AdminGuard'
export { AuthGuard } from './AuthGuard'
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

export { AdminGuard as AdminGuardClient } from './AdminGuard'
// 向后兼容性别名
export {
  AuthGuard as AuthGuardClient,
  AuthGuard as ProtectedRoute,
} from './AuthGuard'
// 认证表单组件
export { LoginForm } from './LoginForm'
export { ProfileForm } from './ProfileForm'
export { RegisterForm } from './RegisterForm'
// 其他认证组件
export { SignInButton } from './SignInButton'
export { UserProfileClient } from './UserProfileClient'
