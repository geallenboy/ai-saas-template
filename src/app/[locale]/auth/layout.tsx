import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Certified - AI SaaS Template',
  description: 'Login or register for an AI SaaS Template account',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
