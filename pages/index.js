import { useState } from 'react'

import Head from 'next/head'
import Link from 'next/link'

import ReactMarkdown from 'react-markdown'
import emojiDictionary from 'emoji-dictionary'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Login from 'components/Login'
import Modal from 'components/Modal'

import packageJson from '../package.json'
import changelogData from '../CHANGELOG.md'

import VcanaLogo from 'public/vcana-logo.svg'
import Close from 'public/close.svg'
import OmbLogo from 'public/omb-logo.svg'

export default function Home() {
  const { t } = useTranslation('common')

  const [isOpenMobile, setIsOpenMobile] = useState(false)
  const [isOpenDesktop, setIsOpenDesktop] = useState(false)
  const [showAllUpdates, setShowAllUpdates] = useState(false)

  const VersionInfo = () => {
    const regex = /(## \[[\s\S]*?)(?=## \[|$)/g
    const currentVersion = packageJson.version
    let matchedTexts = changelogData.match(regex)

    if (!showAllUpdates) {
      matchedTexts = matchedTexts.filter((versionText) =>
        versionText.includes(`[${currentVersion}]`)
      )
    }

    const processedText = matchedTexts
      .join('\n')
      .replace(
        /:(.+?):/g,
        (match, emojiName) => emojiDictionary.getUnicode(emojiName) || match
      )
      .replace(/\(\[\w+\]\(https:\/\/github\.com\/texttree\/v-cana\/commit\/\w+\)\)/g, '')
      .replace(/^### (.+)/gm, (title) => `${title.toUpperCase()}:`)

    return processedText
  }

  return (
    <main className="layout-empty bg-[#f4f4f4]">
      <Head>
        <title>{t('V-CANA')}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col items-center sm:hidden">
        <div className="flex items-center mb-2">
          <VcanaLogo className="max-w-xs my-[6vh] sm:max-w-md w-28" />
          <div
            className="cursor-pointer ml-4 text-xs text-[#909090]"
            onClick={() => setIsOpenMobile(true)}
          >
            {t('Version')} {packageJson.version}
          </div>

          <Modal
            isOpen={isOpenMobile}
            closeHandle={() => setIsOpenMobile(false)}
            isChangelogUpd={true}
            additionalClasses="h-screen w-screen"
            isMobileFullScreen={true}
          >
            <div className="flex sticky top-0 py-6 bg-white justify-between items-center mb-7">
              <p className="text-2xl font-bold text-left">
                {t('Version')} {packageJson.version}
              </p>
              <button className="text-right" onClick={() => setIsOpenMobile(false)}>
                <Close className="h-8 stroke-slate-500" />
              </button>
            </div>
            <ReactMarkdown className="whitespace-pre-line leading-5">
              {VersionInfo()}
            </ReactMarkdown>
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowAllUpdates(!showAllUpdates)}
                className="btn-slate"
              >
                {showAllUpdates ? t('ShowCurrUpdates') : t('ShowAllUpdates')}
              </button>
            </div>
          </Modal>
        </div>
        <div className="bg-white w-[90vw] mb-10 rounded-lg shadow-lg shadow-[#0000001A]">
          <Login />
        </div>
        <div className="text-[#909090] mb-4 text-center">{t('DevelopedBy')}</div>
        <Link href="https://openmediabible.com/" target="_blank">
          <OmbLogo className="logo mb-4" />
        </Link>
      </div>

      <div className="hidden sm:flex">
        <div className="flex flex-col items-center justify-center w-1/2">
          <div className="flex flex-col items-center text-base xl:text-lg">
            <div className="flex flex-col relative items-center mb-2">
              <VcanaLogo className="scale-[1.65] xl:scale-[1.85] mb-4" />
              <div
                className="text-xs cursor-pointer text-[#909090]"
                onClick={() => setIsOpenDesktop(true)}
              >
                {t('Version')} {packageJson.version}
              </div>

              <Modal isOpen={isOpenDesktop} closeHandle={() => setIsOpenDesktop(false)}>
                <div className="flex justify-between items-center mb-7">
                  <p className="text-2xl font-bold text-left">
                    {t('Version')} {packageJson.version}
                  </p>
                  <button className="text-right" onClick={() => setIsOpenDesktop(false)}>
                    <Close className="h-8 stroke-slate-500" />
                  </button>
                </div>
                <ReactMarkdown className="whitespace-pre-line leading-5">
                  {VersionInfo()}
                </ReactMarkdown>
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowAllUpdates(!showAllUpdates)}
                    className="btn-secondary"
                  >
                    {showAllUpdates ? t('ShowCurrUpdates') : t('ShowAllUpdates')}
                  </button>
                </div>
              </Modal>
            </div>
            <h1 className="mb-2 text-center">{t('PlatformForBibleTranslate')}</h1>
            <div className="text-[#909090] mb-2 text-xs">{t('DevelopedBy')}</div>
            <Link href="https://openmediabible.com/" target="_blank">
              <OmbLogo className="logo" />
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center my-4 w-1/2 min-h-[90vh] bg-[url('../public/login_image.jpg')] bg-cover bg-no-repeat rounded-l-lg lg:rounded-l-[48px] xl:rounded-l-[72px] 2xl:rounded-l-[120px] ">
          <div className="w-5/6 xl:w-3/4 2xl:w-3/5 bg-white rounded-lg shadow-lg shadow-[#0000001A] ">
            <Login />
          </div>
        </div>
      </div>
    </main>
  )
}

Home.layoutType = 'empty'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'users'])),
    },
  }
}
