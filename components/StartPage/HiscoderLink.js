import Link from 'next/link'

import Hiscoder from 'public/icons/hiscoder.svg'

function HiscoderLink() {
  return (
    <div className="mx-auto flex flex-1 items-center">
      <Link
        href="https://hiscoder.com"
        target="_blank"
        className="flex items-center gap-4 text-[#CACACA] hover:text-gray-400"
      >
        <span>Powered by</span>
        <Hiscoder className="h-8" />
      </Link>
    </div>
  )
}

export default HiscoderLink
