import { useState, useEffect, useMemo } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useRecoilValue } from 'recoil'

import Timer from 'components/Timer'
import Dropdown from './Dropdown'
import SideBar from './SideBar'

import { stepConfigState } from './state/atoms'
import useSupabaseClient from 'utils/supabaseClient'
import { useCurrentUser } from 'lib/UserContext'

import VcanaLogo from 'public/vcana-logo.svg'
import Down from 'public/arrow-down.svg'
import User from 'public/user.svg'

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
    return !user?.id ? '/' : access ? '/account' : '/agreements'
  }, [access, user])
  return (
    <div className={`bg-th-primary-100 ${isOpenSideBar ? 'sticky top-0 z-30' : ''}`}>
      <div className="appbar" onClick={() => isOpenSideBar && setIsOpenSideBar(false)}>
        <div className="relative md:static flex items-center h-10 md:justify-start md:gap-7">
          <SideBar setIsOpenSideBar={setIsOpenSideBar} access={access} />
          <div
            className={`flex justify-center w-full ${
              access && !isStepPage ? '-ml-10' : ''
            } md:ml-0 `}
          >
            <Link href={logoLink}>
              <VcanaLogo className="h-6 fill-th-text-secondary-100" />
            </Link>
          </div>

          {isStepPage && (
            <div className="flex md:hidden items-center gap-7">
              <div className="px-5 py-2.5 bg-th-secondary-10 rounded-3xl">
                <Timer time={stepConfig.time} />
              </div>
              <Down
                className={`w-6 h-6 stroke-th-text-secondary-100 transition-transform ${
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
              className={`block md:flex flex-col text-center text-th-text-secondary-100 ${
                showFullAppbar ? '' : 'hidden'
              }`}
            >
              <div>{stepConfig.title}</div>
              {stepConfig.subtitle && (
                <div className="text-xs">{stepConfig.subtitle}</div>
              )}
            </div>
            <div
              className={`block md:flex items-center gap-4 justify-center md:justify-start text-th-text-primary ${
                showFullAppbar ? 'flex' : 'hidden'
              }`}
            >
              {stepConfig.count_of_users > 0 && (
                <div className="flex px-5 py-2.5 items-center gap-1 cursor-default bg-th-secondary-10 rounded-3xl">
                  <User className="w-4 h-4 stroke-th-text-primary" />
                  {stepConfig.count_of_users}
                </div>
              )}
              <div className="hidden md:flex px-5 py-2.5 bg-th-secondary-10 rounded-3xl">
                <Timer time={stepConfig.time} />
              </div>
              <Dropdown description={stepConfig?.description} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
