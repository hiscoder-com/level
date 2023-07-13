import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useRecoilValue } from 'recoil'

import Dropdown from './Dropdown'
import SideBar from './SideBar'

import Timer from 'components/Timer'

import useSupabaseClient from 'utils/supabaseClient'
import { useCurrentUser } from 'lib/UserContext'
import { stepConfigState } from './Panel/state/atoms'

import Down from 'public/arrow-down.svg'
import User from 'public/user.svg'
import VCANA_logo from 'public/vcana-logo.svg'

export default function AppBar({ setIsOpenSideBar, isOpenSideBar }) {
  const supabase = useSupabaseClient()
  const [showFullAppbar, setShowFullAppbar] = useState(false)
  const [isStepPage, setIsStepPage] = useState(false)
  const [access, setAccess] = useState(false)

  const stepConfig = useRecoilValue(stepConfigState)
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

  return (
    <div className={`bg-white ${isOpenSideBar ? 'sticky top-0 z-30' : ''}`}>
      <div className="appbar" onClick={() => isOpenSideBar && setIsOpenSideBar(false)}>
        <div className="relative md:static flex items-center justify-between md:justify-start gap-7 cursor-pointer">
          <SideBar setIsOpenSideBar={setIsOpenSideBar} access={access} />
          <Link
            href="/account"
            className={
              !isStepPage
                ? 'absolute sm:static left-1/2 sm:left-auto -translate-x-1/2 sm:translate-x-0'
                : ''
            }
          >
            <VCANA_logo className="h-6" />
          </Link>
          {isStepPage && (
            <div className="flex gap-7 md:hidden">
              <Timer time={stepConfig.time} />
              <Down
                className="w-6 h-6"
                onClick={() => setShowFullAppbar((prev) => !prev)}
              />
            </div>
          )}
        </div>
        {isStepPage && (
          <>
            <div className={`pt-2 md:flex text-center ${showFullAppbar ? '' : 'hidden'}`}>
              {stepConfig.title}
            </div>
            <div
              className={`items-center gap-4 md:flex justify-center md:justify-start ${
                showFullAppbar ? 'flex' : 'hidden'
              }`}
            >
              <div className="flex row items-center gap-1 cursor-default">
                <User className="w-5 text-cyan-600" />
                {stepConfig.count_of_users}
              </div>
              <div className="hidden md:flex">
                <Timer time={stepConfig.time} />
              </div>

              <Dropdown description={stepConfig?.description} user={user} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
