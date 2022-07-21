import { useState, useEffect } from 'react'
import { Disclosure } from '@headlessui/react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { supabase } from '../utils/supabaseClient'
import { useUser } from '../lib/UserContext'

import Timer from './Timer'
import Burger from '../public/burger.svg'
import User from '../public/user.svg'
import Tools from '../public/tools.svg'
import VCANA_logo from '../public/vcana-logo.svg'
import { steps } from '../utils/steps'

export default function AppBar({ isOpen, setIsOpen }) {
  const { user } = useUser()
  const [access, setAccess] = useState(false)
  const [showFullAppbar, setShowFullAppbar] = useState(false)
  const [isStepPage, setIsStepPage] = useState(false)
  const [showModalStepGoal, setShowModalStepGoal] = useState(false)
  const { t } = useTranslation(['steps', 'common'])

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

  const conditionAppbar = `appbar ${showFullAppbar ? 'h-28' : 'h-10'}`
  const checkShowFullAppbar = showFullAppbar ? 'visible' : 'invisible'
  const showFullAppbarBtn = `${isStepPage ? 'md:hidden' : 'hidden'}`
  const conditionTitle = `condition-title ${checkShowFullAppbar}`
  const conditionOptionalInfo = `condition-optional-info ${checkShowFullAppbar}`

  return (
    <Disclosure as="nav" className="bg-white">
      <div>
        <div className={conditionAppbar}>
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
              className={showFullAppbarBtn}
            />
          </div>
          {isStepPage && (
            <>
              <div className={conditionTitle}>{t(steps[step].title)}</div>
              <div className={conditionOptionalInfo}>
                <div className="flex row items-center gap-1 cursor-default">
                  <User />
                  {steps[step].users}
                </div>
                <div className="w-0 invisible md:w-14 md:visible">
                  <Timer time={steps[step].time} />
                </div>
                <button
                  className="btn-cyan w-28"
                  onClick={(e) => (
                    setShowModalStepGoal(!showModalStepGoal), e.stopPropagation()
                  )}
                >
                  {t('Step goal', { ns: 'common' })}
                </button>
                <Tools />
              </div>
            </>
          )}
        </div>
        {showModalStepGoal ? (
          <div className="modal-step-goal-bg" onClick={() => setShowModalStepGoal(false)}>
            <div className="modal-step-goal" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-justify mt-2 mx-4 h4 font-semibold indent-4">
                {t(steps[step].stepGoal)}
              </h2>
              <button
                className="btn-cyan w-24"
                onClick={() => setShowModalStepGoal(false)}
              >
                {t('Close')}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Disclosure>
  )
}
