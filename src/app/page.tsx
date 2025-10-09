import { redirect } from 'next/navigation'
import { defaultLocale } from '@/translate/i18n/config'

export default function RootPage() {
  redirect(`/${defaultLocale}`)
}
