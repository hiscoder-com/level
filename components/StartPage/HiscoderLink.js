import Link from 'next/link'

import Hiscoder from 'public/icons/hiscoder.svg'

function HiscoderLink() {
  return (
    <div className="flex items-center justify-center gap-4 pb-4 text-[#CACACA]">
      <div>Powered by</div>
      <Link href="https://hiscoder.com" target="_blank">
        <Hiscoder className="h-8" />
      </Link>
    </div>
  )
}

export default HiscoderLink
