import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import useSupabaseClient from 'utils/supabaseClient'

import LeftArrow from 'public/left-arrow.svg'
import RightArrow from 'public/right-arrow.svg'

export default function ConfessionSteps() {
  const supabase = useSupabaseClient()
  const { t } = useTranslation(['confession-steps', 'common', 'users'])
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [page, setPage] = useState(0)

  const confessionSteps = [
    <p
      dangerouslySetInnerHTML={{
        __html: t('Step1', { interpolation: { escapeValue: false } }),
      }}
      key={1}
      className="text-center"
    />,
    <ul key={2} className="list-disc">
      <li className="pb-5">{t('Step2.li1')}</li>
      <li className="pb-5">{t('Step2.li2')}</li>
      <li>{t('Step2.li3')}</li>
    </ul>,
    <ul key={3} className="list-disc">
      <li className="pb-5">{t('Step3.li1')}</li>
      <li>{t('Step3.li2')}</li>
    </ul>,
    <ul key={4} className="list-disc">
      <li className="pb-5">{t('Step4.li1')}</li>
      <li className="pb-5">{t('Step4.li2')}</li>
      <li>{t('Step4.li3')}</li>
    </ul>,
    <ul key={5} className="list-disc">
      <li className="pb-5">{t('Step5.li1')}</li>
      <li className="pb-5">{t('Step5.li2')}</li>
      <li>{t('Step5.li3')}</li>
    </ul>,
    <p key={6}>{t('Step6')}</p>,
  ]

  const prevPage = () => {
    setPage((prev) => {
      return prev > 0 ? prev - 1 : prev
    })
  }
  const nextPage = () => {
    setPage((prev) => {
      return prev < 5 ? prev + 1 : prev
    })
  }

  const handleKeyDown = (e) => {
    switch (e.keyCode) {
      case 37:
        prevPage()
        break
      case 39:
        nextPage()
        break
    }
  }
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleClick = async () => {
    const { error } = await supabase.rpc('check_confession')
    if (error) {
      console.error(error)
    } else {
      router.push(`/account`)
    }
  }

  return (
    <div className="layout-appbar">
      <h1 className="text-4xl text-center">{t('users:Confession')}:</h1>
      <div className="flex flex-row h-full flex-wrap sm:flex-nowrap justify-evenly sm:justify-center w-full xl:w-4/5 max-w-7xl gap-4">
        <div className="flex items-center">
          <button disabled={page < 1} onClick={prevPage} className="arrow">
            <LeftArrow />
          </button>
        </div>
        <div className="confession-text">{confessionSteps[page]}</div>
        <div className="flex items-center">
          <button disabled={page > 4} onClick={nextPage} className="arrow">
            <RightArrow />
          </button>
        </div>
      </div>
      <div
        className={`flex flex-row items-center space-x-6 ${
          page === 5 ? '' : 'hidden sm:flex sm:invisible'
        }`}
      >
        <div className="space-x-1.5 items-center text-xl">
          <input
            id="cb"
            type="checkbox"
            checked={checked}
            onChange={() => setChecked((prev) => !prev)}
          />
          <label htmlFor="cb">{t('users:Agree')}</label>
        </div>
        <button onClick={handleClick} className="btn-cyan w-28" disabled={!checked}>
          {t('common:Next')}
        </button>
      </div>
    </div>
  )
}
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['confession-steps', 'common', 'users'])),
    },
  }
}
