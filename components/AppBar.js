import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { supabase } from 'utils/supabaseClient'
import { steps } from 'utils/steps'
import { useCurrentUser } from 'lib/UserContext'

import Modal from './Modal'
import Timer from './Timer'

import Burger from 'public/burger.svg'
import Tools from 'public/tools.svg'
import User from 'public/user.svg'
import VCANA_logo from 'public/vcana-logo.svg'

// TODO тут надо все проверить

export default function AppBar({ setIsOpen }) {
  const { user } = useCurrentUser()
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
      try {
        const { data, error } = await supabase.rpc('has_access', {
          user_id,
        })
        if (error) throw error
        setAccess(data)
      } catch (error) {
        return error
      }
    }
    if (user?.id) {
      hasAccess(user.id)
    }
  }, [user])

  return (
    <div className="bg-white">
      <div className="appbar">
        <div className="flex items-center gap-7 cursor-pointer">
          {access && (
            <Burger onClick={() => setIsOpen((prev) => !prev)} className="h-6 stroke-1" />
          )}
          <Link href="/">
            <a>
              <VCANA_logo className="h-5" />
            </a>
          </Link>
          {isStepPage && (
            <div className="flex gap-7 md:hidden">
              <Timer time={steps[step].time} />
              <Burger onClick={() => setShowFullAppbar(!showFullAppbar)} />
            </div>
          )}
        </div>
        {isStepPage && (
          <>
            <div className={`condition-title ${showFullAppbar ? '' : 'hidden '}`}>
              {t(steps[step].title)}
            </div>
            <div
              className={`condition-optional-info ${showFullAppbar ? 'flex' : 'hidden '}`}
            >
              <div className="flex row items-center gap-1 cursor-default">
                <User />
                {steps[step].users}
              </div>
              <div className="hidden md:flex">
                <Timer time={steps[step].time} />
              </div>
              <Modal />
              <Tools />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
