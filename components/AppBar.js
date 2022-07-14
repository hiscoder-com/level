import { useState, useEffect } from 'react'

import Link from 'next/link'

import { Disclosure } from '@headlessui/react'

import { supabase } from '@/utils/supabaseClient'
import { useUser } from '../lib/UserContext'

import Burger from '../public/burger.svg'
import VCANA_logo from '../public/vcana-logo.svg'

export default function AppBar({ isOpen, setIsOpen }) {
  const { user } = useUser()
  const [access, setAccess] = useState(false)
  useEffect(() => {
    const hasAccess = async (user_id) => {
      const { data, error } = await supabase.rpc('has_access', {
        user_id,
      })

      setAccess(data)
    }
    if (user?.id) {
      hasAccess(user.id)
    }
  }, [user])

  return (
    <Disclosure as="nav" className={'bg-white'}>
      <>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16 ">
            <div className="flex-1 flex row items-center justify-between ">
              <div className="flex items-center gap-7 cursor-pointer">
                {access && (
                  <Burger
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="h-6 stroke-1 hover:stroke-[#0E7490]"
                  />
                )}
                <Link href="/">
                  <a>
                    <VCANA_logo className="h-5" />
                  </a>
                </Link>
              </div>
              {/* Title */}
              <div className="text-emerald-500"></div>
              {/* Optional info */}
              <div className="text-teal-500"></div>
            </div>
          </div>
        </div>
      </>
    </Disclosure>
  )
}
