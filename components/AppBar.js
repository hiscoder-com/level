import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useCurrentUser } from 'lib/UserContext'
import Down from 'public/arrow-down.svg'
import LevelLogo from 'public/level-logo.svg'
import User from 'public/user.svg'
import { useRecoilValue } from 'recoil'

import Timer from 'components/Timer'

import Dropdown from './Dropdown'
import SideBar from './SideBar'
import { stepConfigState } from './state/atoms'

import useSupabaseClient from 'utils/supabaseClient'

export default function AppBar({ setIsOpenSideBar, isOpenSideBar }) {
  const [showFullAppbar, setShowFullAppbar] = useState(false)
  const [isStepPage, setIsStepPage] = useState(false)
  const [access, setAccess] = useState(false)
  const stepConfig = useRecoilValue(stepConfigState)
  const supabase = useSupabaseClient()
  const { user } = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    setIsStepPage(router.pathname === '/translate/[project]/[book]/[chapter]/[step]')
  }, [router.pathname])

  useEffect(() => {
    const hasAccess = async () => {
      try {
        const { data, error } = await supabase.rpc('has_access')
        if (error) throw error
        setAccess(data)
      } catch (error) {
        return error
      }
    }
    if (user?.id) {
      hasAccess()
    }
  }, [supabase, user])

  const logoLink = useMemo(() => {
    return !user?.id ? '/' : access ? '/account?tab=0' : '/agreements'
  }, [access, user])

  return (
    <div className="sticky top-0 z-30 bg-th-primary-100">
      <div className="appbar" onClick={() => isOpenSideBar && setIsOpenSideBar(false)}>
        <div className="relative flex h-10 items-center md:static md:justify-start md:gap-7">
          {![
            '/user-agreement',
            '/confession-steps',
            '/agreements',
            '/404',
            '/privacy-policy',
          ].includes(router.pathname) && (
            <SideBar
              setIsOpenSideBar={setIsOpenSideBar}
              access={access}
              isOpenSideBar={isOpenSideBar}
            />
          )}
          <div
            className={`flex w-full justify-center ${
              access && !isStepPage ? 'lg:ms-4 xl:-ml-2 2xl:-ml-6' : ''
            }`}
          >
            <Link href={logoLink}>
              <LevelLogo className="h-8 fill-th-text-secondary-100" />
            </Link>
          </div>

          {isStepPage && (
            <div className="flex items-center gap-7 md:hidden">
              <div className="rounded-3xl bg-th-secondary-10 px-5 py-2.5">
                <Timer time={stepConfig.time} />
              </div>
              <Down
                className={`h-6 w-6 stroke-th-text-secondary-100 transition-transform ${
                  showFullAppbar ? 'rotate-180' : ''
                }`}
                onClick={() => setShowFullAppbar((prev) => !prev)}
              />
            </div>
          )}
        </div>
        {isStepPage && (
          <>
            <div
              className={`block flex-col text-center text-th-text-secondary-100 md:flex ${
                showFullAppbar ? '' : 'hidden'
              }`}
            >
              <div>{stepConfig.title}</div>
              {stepConfig.subtitle && (
                <div className="text-xs">{stepConfig.subtitle}</div>
              )}
            </div>
            <div
              className={`block items-center justify-center gap-4 text-th-text-primary md:flex md:justify-start ${
                showFullAppbar ? 'flex' : 'hidden'
              }`}
            >
              {stepConfig.count_of_users > 0 && (
                <div className="flex cursor-default items-center gap-1 rounded-3xl bg-th-secondary-10 px-5 py-2.5">
                  <User className="h-4 w-4 stroke-th-text-primary" />
                  {stepConfig.count_of_users}
                </div>
              )}
              <div className="hidden rounded-3xl bg-th-secondary-10 px-5 py-2.5 md:flex">
                <Timer time={stepConfig.time} />
              </div>
              <Dropdown
                description={stepConfig?.description}
                isWholeBook={stepConfig?.whole_book}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
