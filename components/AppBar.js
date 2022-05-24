import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import Link from 'next/link'
import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline'
import Burger from '../public/Burger.svg'
import VCANA_logo from '../public/VCANA_logo.svg'

// const navigation = [
//   { name: 'Home', href: '/', current: false },
//   { name: 'Sign up', href: '#', current: false },
// ]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AppBar({ setIsOpen }) {
  return (
    <Disclosure as="nav" className="border-b">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* <div className="w-4/6 mx-auto px-4"> */}
            <div className="relative flex items-center justify-between h-16 ">
              <div className="flex-1 flex row items-center justify-between ">
                {/* menu & logo */}
                <div className="flex items-center gap-7 cursor-pointer">
                  <Burger
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="h-6 stroke-1 hover:stroke-[#0E7490]"
                  />
                  <Link href="/" passHref>
                    <VCANA_logo className="h-5" />
                  </Link>
                </div>
                {/* Title */}
                <div className="text-emerald-500"></div>
                {/* Optional info */}
                <div className="text-teal-500"></div>
                {/* <div className="flex space-x-4">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'px-3 py-2 rounded-md text-sm font-medium'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </a>
                  ))}
                </div> */}
              </div>
            </div>
          </div>

          {/* <Disclosure.Panel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block px-3 py-2 rounded-md text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel> */}
        </>
      )}
    </Disclosure>
  )
}
