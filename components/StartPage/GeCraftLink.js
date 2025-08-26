import Link from 'next/link'

import GeCraft from 'public/icons/gecraft.svg'

function GeCraftLink() {
  return (
    <div className="mx-auto flex flex-1 items-center">
      <Link
        href="https://gecraft.com"
        target="_blank"
        className="flex items-center gap-4 p-2 text-[#CACACA] hover:text-gray-400"
      >
        <span>Powered by</span>
        <GeCraft className="h-8" />
      </Link>
    </div>
  )
}

export default GeCraftLink
