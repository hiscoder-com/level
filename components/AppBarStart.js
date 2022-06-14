import Link from 'next/link'

import VcanaLogo from '../public/vcana-logo.svg'

export default function AppBar() {
  return (
    <div className="mx-auto max-w-7xl px-4 h-16 flex items-center sm:px-6 lg:px-8">
      <Link href="/" passHref>
        <VcanaLogo className="h-5 cursor-pointer" />
      </Link>
    </div>
  )
}
