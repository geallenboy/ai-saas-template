'use client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'

export const LanguageSwitcher = () => {
  const t = useTranslations('locale')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (newLocale: string) => {
    // Remove the current language prefix
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    // Navigate to the new language path
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="header-button">
          <Globe className="icon-globe h-5 w-5 transition-all duration-300" />
          <span className="sr-only">{t('label')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="dropdown-enhanced">
        <DropdownMenuItem
          onClick={() => switchLanguage('de')}
          className="dropdown-item-enhanced"
        >
          <span className="text-xl">🇨🇳</span>
          <span className="flex-1 font-medium">{t('de')}</span>
          {locale === 'de' && <div className="status-indicator" />}
        </DropdownMenuItem>
        <div className="dropdown-separator" />
        <DropdownMenuItem
          onClick={() => switchLanguage('en')}
          className="dropdown-item-enhanced"
        >
          <span className="text-xl">🇺🇸</span>
          <span className="flex-1 font-medium">{t('en')}</span>
          {locale === 'en' && <div className="status-indicator" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSwitcher
