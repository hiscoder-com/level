import { useState, useEffect } from 'react'

import Link from 'next/link'

import { Disclosure } from '@headlessui/react'

import { supabase } from '@/utils/supabaseClient'
import { useUser } from '../lib/UserContext'

import Timer from './Timer'

import Burger from '../public/burger.svg'
import User from '../public/user.svg'
import Tools from '../public/tools.svg'
import VCANA_logo from '../public/vcana-logo.svg'

export default function AppBar({ isOpen, setIsOpen, isIntroduction, setIsIntroduction }) {
  const { user } = useUser()
  const [access, setAccess] = useState(false)

  const [step, setStep] = useState(1)

  useEffect(() => {
    const hasAccess = async (user_id) => {
      try {
        const { data, error } = await supabase.rpc('has_access', {
          user_id,
        })
        if (error) throw error
        setAccess(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
    }
    if (user?.id) {
      hasAccess(user.id)
    }
  }, [user])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const prevStep = () => {
    if (step > 1) {
      setStep((prev) => {
        return prev > 0 ? prev - 1 : prev
      })
    }
  }

  const nextStep = () => {
    setStep((prev) => {
      return prev < 7 ? prev + 1 : prev
    })
  }

  const handleKeyDown = (e) => {
    switch (e.keyCode) {
      case 37:
        prevStep()
        break
      case 39:
        nextStep()
        break
    }
  }

  const steps = {
    1: {
      title: 'Шаг 1: Самостоятельное изучение',
      users: 1,
      time: 3600,
      tools: {},
    },
    2: {
      title: 'Шаг 2: Командное изучение текста',
      users: 1,
      time: 3000,
      tools: {},
    },
    3: {
      title: 'Шаг 3: Подготовка к переводу',
      users: 1,
      time: 3600,
      tools: {},
    },
    4: {
      title: 'Шаг 4: Набросок “Вслепую”',
      users: 1,
      time: 3600,
      tools: {},
    },
    5: {
      title: 'Шаг 5: Самостоятельная проверка',
      users: 1,
      time: 3600,
      tools: {},
    },
    6: {
      title: 'Шаг 6: Взаимная проверка',
      users: 2,
      time: 3600,
      tools: {},
    },
    7: {
      title: 'Шаг 7: Командная проверка',
      users: 2,
      time: 3600,
      tools: {},
    },
  }

  const conditionTitle = `h2 text-center ${isIntroduction ? '' : 'hidden'}`
  const conditionOptionalInfo = `flex row items-center gap-4 ${
    isIntroduction ? '' : 'hidden'
  }`

  return (
    <Disclosure as="nav" className="bg-white">
      <>
        <div className="appbar">
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
          <div className={conditionTitle}>{steps[step].title}</div>
          {/* Optional info */}
          <div className={conditionOptionalInfo}>
            <div className="flex row items-center gap-1 cursor-default">
              <User />
              {steps[step].users}
            </div>
            <Timer time={steps[step].time} />
            <button className="btn-cyan w-28">Цель шага</button>
            <Tools />
          </div>
        </div>
      </>
    </Disclosure>
  )
}
