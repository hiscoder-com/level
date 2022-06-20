import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import LeftArrow from '../public/left-arrow.svg'
import RightArrow from '../public/right-arrow.svg'

export default function ConfessionSteps() {
  const { t } = useTranslation(['confession-steps', 'common'])

  const [checked, setChecked] = useState(false)
  const [page, setPage] = useState(0)

  const arrConfText = [
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
  return (
    <div className="layout-appbar gap-7">
      <h1 className="h1">{t('ConfessionFaith', { ns: 'common' })}:</h1>
      <div className="flex flex-row min-h-[18rem] w-4/5 max-w-7xl gap-4">
        <div className="flex items-center">
          <button disabled={page < 1} onClick={prevPage} className="arrow">
            <LeftArrow />
          </button>
        </div>
        <div className="confession-text w-full">{arrConfText[page]}</div>
        <div className="flex items-center">
          <button disabled={page > 4} onClick={nextPage} className="arrow">
            <RightArrow />
          </button>
        </div>
      </div>
      <div
        className={`flex flex-row items-center space-x-6 ${
          page === 5 ? '' : 'invisible'
        }`}
      >
        <div className="space-x-1.5 items-center h4">
          <input
            id="cb"
            type="checkbox"
            checked={checked}
            onChange={() => setChecked((prev) => !prev)}
          />
          <label htmlFor="cb">{t('Agree', { ns: 'common' })}</label>
        </div>
        <button className="btn-filled w-28" disabled={!checked}>
          {t('Next', { ns: 'common' })}
        </button>
      </div>
    </div>
  )
}
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['confession-steps', 'common'])),
      // Will be passed to the page component as props
    },
  }
}
