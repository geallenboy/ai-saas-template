import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  withLink?: boolean
  className?: string
}

export const Logo = ({
  withLink = true,
  className = 'flex items-center gap-2',
}: LogoProps) => {
  const logoContent = (
    <>
      <Image src="/logo.png" alt="logo" width={40} height={40} />
      <span className="text-lg font-semibold">AI SaaS</span>
    </>
  )

  if (withLink) {
    return (
      <Link href="/" className={className}>
        {logoContent}
      </Link>
    )
  }

  return <div className={className}>{logoContent}</div>
}

export default Logo
