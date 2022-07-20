import { useState, useEffect } from 'react'
import { Disclosure } from '@headlessui/react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { supabase } from '../utils/supabaseClient'
import { useUser } from '../lib/UserContext'
import Timer from './Timer'
import Burger from '../public/burger.svg'
import User from '../public/user.svg'
import Tools from '../public/tools.svg'
import VCANA_logo from '../public/vcana-logo.svg'

const steps = {
  1: {
    title: 'Шаг 1: Самостоятельное изучение',
    users: 1,
    time: 2400,
    stepGoal:
      'ЦЕЛЬ этого шага: понять общий смысл и цель книги, а также контекст (обстановку, время и место, любые факты, помогающие более точно перевести текст) и подготовиться к командному обсуждению текста перед тем, как начать перевод.',
    tools: {},
  },
  2: {
    title: 'Шаг 2: Командное изучение текста',
    users: 4,
    time: 3000,
    stepGoal:
      'ЦЕЛЬ этого шага: хорошо понять смысл текста и слов всей командой, а также принять командное решение по переводу некоторых слов перед тем, как начать основную работу.',
    tools: {},
  },
  3: {
    title: 'Шаг 3: Подготовка к переводу',
    users: 2,
    time: 1200,
    stepGoal: 'ЦЕЛЬ этого шага: подготовиться к переводу текста естественным языком.',
    tools: {},
  },
  4: {
    title: 'Шаг 4: Набросок “Вслепую”',
    users: 1,
    time: 1200,
    stepGoal: 'ЦЕЛЬ этого шага: сделать первый набросок естественным языком.',
    tools: {},
  },
  5: {
    title: 'Шаг 5: Самостоятельная проверка',
    users: 1,
    time: 1800,
    stepGoal:
      'ЦЕЛЬ этого шага: поработать над ошибками в тексте и убедиться, что первый набросок перевода получился достаточно точным и естественным.',
    tools: {},
  },
  6: {
    title: 'Шаг 6: Взаимная проверка',
    users: 2,
    time: 2400,
    stepGoal:
      'ЦЕЛЬ этого шага: улучшить набросок перевода, пригласив другогого человека, чтобы проверить перевод на точность и естественность.',
    tools: {},
  },
  7: {
    title: 'Шаг 7: Командная проверка',
    users: 4,
    time: 3600,
    stepGoal:
      'ЦЕЛЬ этого шага: улучшить перевод, приняв решения командой о трудных словах или фразах, делая текст хорошим как с точки зрения точности, так и с точки зрения естественности. Это финальный шаг в работе над текстом.',
    tools: {},
  },
}

export default function AppBar({ isOpen, setIsOpen }) {
  const { user } = useUser()
  const [access, setAccess] = useState(false)
  const [showFullAppbar, setShowFullAppbar] = useState(false)
  const [isStepPage, setIsStepPage] = useState(false)
  const [showModalStepGoal, setShowModalStepGoal] = useState(false)

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
              <div className={conditionTitle}>{steps[step].title}</div>
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
                  Цель шага
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
                {steps[step].stepGoal}
              </h2>
              <button
                className="btn-cyan w-24"
                onClick={() => setShowModalStepGoal(false)}
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Disclosure>
  )
}
