import { MembershipCenter } from '@/components/payment/MembershipCenter'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function MembershipPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/auth/sign-in?redirect=/membership')
  }

  return (
    <div className="min-h-screen bg-background">
      <MembershipCenter />
    </div>
  )
}

export const metadata = {
  title: 'Member Center - AI SaaS Template',
  description:
    'Manage your membership benefits, view usage statistics, and billing information',
}
