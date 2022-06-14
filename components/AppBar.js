import Link from 'next/link'

import { Disclosure } from '@headlessui/react'

import Burger from '../public/burger.svg'
import VCANA_logo from '../public/vcana-logo.svg'

export default function AppBar({ isOpen, setIsOpen }) {
  return (
    <Disclosure as="nav">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between h-16 ">
              <div className="flex-1 flex row items-center justify-between ">
                {isOpen ? (
                  <div className="flex items-center gap-7 cursor-pointer">
                    <Link href="/" passHref>
                      <VCANA_logo className="h-5" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-7 cursor-pointer">
                    <Burger
                      onClick={() => setIsOpen((prev) => !prev)}
                      className="h-6 stroke-1 hover:stroke-[#0E7490]"
                    />
                    <Link href="/" passHref>
                      <VCANA_logo className="h-5" />
                    </Link>
                  </div>
                )}
                {/* Title */}
                <div className="text-emerald-500"></div>
                {/* Optional info */}
                <div className="text-teal-500"></div>
              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  )
}
