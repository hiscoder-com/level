import { useState, useEffect } from 'react'

import Link from 'next/link'

import { Disclosure } from '@headlessui/react'

import { supabase } from '../utils/supabaseClient'
import { useUser } from '../lib/UserContext'

import Timer from './Timer'

import Burger from '../public/burger.svg'
import User from '../public/user.svg'
import Tools from '../public/tools.svg'
import VCANA_logo from '../public/vcana-logo.svg'

export default function AppBar({ isOpen, setIsOpen }) {
  const { user } = useUser()
  const [access, setAccess] = useState(false)
  const [step, setStep] = useState(1)

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
      return prev < 8 ? prev + 1 : prev
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
      tools: {},
    },
    2: {
      title: 'Шаг 2: Командное изучение текста',
      users: 1,
      tools: {},
    },
    3: {
      title: 'Шаг 3: Командное изучение текста',
      users: 1,
      tools: {},
    },
    4: {
      title: 'Шаг 4: Набросок “Вслепую”',
      users: 1,
      tools: {},
    },
    5: {
      title: 'Шаг 5: Самостоятельная проверка',
      users: 1,
      tools: {},
    },
    6: {
      title: 'Шаг 6: Взаимная проверка',
      users: 2,
      tools: {},
    },
    7: {
      title: 'Шаг 7: Проверка ключевых слов',
      users: 2,
      tools: {},
    },
    8: {
      title: 'Шаг 8: Командный обзор перевода',
      users: 2,
      tools: {},
    },
  }

  return (
    <Disclosure as="nav" className="bg-white">
      <>
        <div className="appbar">
          <div className="flex flex-1 flex-col items-center justify-between md:flex-row">
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
            <div className="h2">{steps[step].title}</div>
            {/* Optional info */}
            <div className="flex row items-center gap-4">
              <div className="flex row items-center gap-1 cursor-default">
                <User />
                {steps[step].users}
              </div>
              <Timer />
              <button className="btn-cyan w-28">Цель шага</button>
              <Tools />
            </div>
          </div>
        </div>
      </>
    </Disclosure>
  )
}
