import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { Disclosure } from '@headlessui/react'

import { supabase } from '../utils/supabaseClient'
import { steps } from '../utils/steps'
import { useUser } from '../lib/UserContext'

import Timer from './Timer'
import ModalStepGoal from './ModalStepGoal'
import Burger from '../public/burger.svg'
import User from '../public/user.svg'
import Tools from '../public/tools.svg'
import VCANA_logo from '../public/vcana-logo.svg'

export default function AppBar({ setIsOpen }) {
  const { user } = useUser()
  const [access, setAccess] = useState(false)
  const [showFullAppbar, setShowFullAppbar] = useState(false)
  const [isStepPage, setIsStepPage] = useState(false)
  const { t } = useTranslation('steps')

  const router = useRouter()
  const { step } = router.query

  useEffect(() => {
    setIsStepPage(router.pathname === '/steps/[step]')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname])

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
    <Disclosure as="nav" className="bg-white">
      <div>
        <div className={`appbar ${showFullAppbar ? 'h-28' : 'h-10'}`}>
          <div className="flex items-center gap-7 cursor-pointer">
            {access && (
              <Burger
                onClick={() => setIsOpen((prev) => !prev)}
                className="h-6 stroke-1"
              />
            )}
            <Link href="/">
              <a>
                <VCANA_logo className="h-5" />
              </a>
            </Link>
            {isStepPage && (
              <div className="md:hidden">
                <Timer time={steps[step].time} />
              </div>
            )}
            <Burger
              onClick={() => setShowFullAppbar(!showFullAppbar)}
              className={`${isStepPage ? 'md:hidden' : 'hidden'}`}
            />
          </div>
          {isStepPage && (
            <>
              <div
                className={`condition-title ${showFullAppbar ? 'visible' : 'invisible'}`}
              >
                {t(steps[step].title)}
              </div>
              <div
                className={`condition-optional-info ${
                  showFullAppbar ? 'visible' : 'invisible'
                }`}
              >
                <div className="flex row items-center gap-1 cursor-default">
                  <User />
                  {steps[step].users}
                </div>
                <div className="w-0 invisible md:w-14 md:visible">
                  <Timer time={steps[step].time} />
                </div>
                <ModalStepGoal />
                <Tools />
              </div>
            </>
          )}
        </div>
      </div>
    </Disclosure>
  )
}
