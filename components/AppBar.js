import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import ReactMarkdown from 'react-markdown'
import { useRecoilValue } from 'recoil'
import emojiDictionary from 'emoji-dictionary'

import Dropdown from './Dropdown'
import SideBar from './SideBar'
import Modal from './Modal'

import Timer from 'components/Timer'

import useSupabaseClient from 'utils/supabaseClient'
import { useCurrentUser } from 'lib/UserContext'
import { stepConfigState } from './Panel/state/atoms'

import packageJson from '../package.json'
import changelogData from '../CHANGELOG.md'

import Down from 'public/arrow-down.svg'
import User from 'public/user.svg'
import VCANA_logo from 'public/vcana-logo.svg'

export default function AppBar({ setIsOpenSideBar, isOpenSideBar }) {
  const supabase = useSupabaseClient()
  const [showFullAppbar, setShowFullAppbar] = useState(false)
  const [isStepPage, setIsStepPage] = useState(false)
  const [access, setAccess] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

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

  const VersionInfo = () => {
    const regex = /(## \[[\s\S]*?)(?=## \[|$)/g
    const changelogVersions = changelogData.match(regex)
    const currentVersion = packageJson.version
    const currentVersionText = changelogVersions.find((versionText) =>
      versionText.includes(`[${currentVersion}]`)
    )

    const emojiConvertedText = currentVersionText.replace(
      /:(.+?):/g,
      (match, p1) => emojiDictionary.getUnicode(p1) || match
    )

    const commitRemovedText = emojiConvertedText.replace(
      /\(\[\w+\]\(https:\/\/github\.com\/texttree\/v-cana\/commit\/\w+\)\)/g,
      ''
    )

    return commitRemovedText
  }

  return (
    <div className={`bg-white ${isOpenSideBar ? 'sticky top-0 z-30' : ''}`}>
      <div className="appbar" onClick={() => isOpenSideBar && setIsOpenSideBar(false)}>
        <div className="relative md:static flex items-center justify-between md:justify-start gap-7 cursor-pointer">
          <SideBar setIsOpenSideBar={setIsOpenSideBar} access={access} />
          <div className="flex items-center">
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
            {!isStepPage && (
              <div className="cursor-pointer ml-4" onClick={openModal}>
                Version {packageJson.version}
              </div>
            )}
          </div>

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
      <Modal isOpen={isOpen} closeHandle={closeModal} className="tertiary">
        <div className="flex justify-between items-center mb-5">
          <p className="text-2xl text-left">Version {packageJson.version}</p>
          <button className="text-right" onClick={closeModal}>
            X
          </button>
        </div>
        <ReactMarkdown className="whitespace-pre-line">{VersionInfo()}</ReactMarkdown>
      </Modal>
    </div>
  )
}
