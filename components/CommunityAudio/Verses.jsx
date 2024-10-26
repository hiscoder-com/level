import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { Disclosure, Combobox, Tab, Transition } from '@headlessui/react'

import Breadcrumbs from 'components/Breadcrumbs'

import { useCurrentUser } from 'lib/UserContext'
import {
  useAccess,
  useGetBooks,
  useGetChaptersTranslate,
  useGetResource,
  useProject,
} from 'utils/hooks'

import {
  checkBookCodeExists,
  checkChapterVersesExist,
  getVerseCount,
  getVerseCountOBS,
  getVerseObjectsForBookAndChapter,
} from 'utils/helper'

import { oldTestamentList, newTestamentList, usfmFileNames } from '/utils/config'

import Down from '/public/arrow-down.svg'
import Left from '/public/left.svg'
import Gear from '/public/gear.svg'

function Verses({ verseObjects, user, reference, isLoading }) {
  const {
    push,
    query: { bookid, code },
  } = useRouter()

  const [{ isCoordinatorAccess }] = useAccess({
    user_id: user?.id,
    code,
  })
  const [project] = useProject({ code })
  const { t } = useTranslation()
  const [books] = useGetBooks({ code })

  const verseCount = useMemo(() => {
    if (project?.type === 'obs') {
      return getVerseCountOBS(books, reference?.chapter)
    } else {
      return getVerseCount(books, bookid, reference?.chapter)
    }
  }, [books, project?.type, bookid, reference?.chapter])

  return (
    <div className="flex flex-col gap-5">
      <div className="hidden xl:block">
        <Breadcrumbs
          links={
            reference && [
              { title: project?.title, href: '/projects/' + project?.code },
              { title: t('Reader') },
            ]
          }
        />
      </div>
      {reference?.chapter && (
        <div className="text-xl font-bold">{`${t('books:' + bookid)} ${
          reference?.chapter
        }`}</div>
      )}
      <div
        className={`flex flex-col gap-2 ${!verseObjects ? 'h-screen' : ''}`}
        dir={project?.is_rtl ? 'rtl' : 'ltr'}
      >
        {!isLoading ? (
          verseObjects ? (
            <>
              {Array.from({ length: Math.min(verseCount + 1, 200) }).map((_, index) => {
                const verseIndex = verseObjects?.verseObjects?.findIndex(
                  (verse) => parseInt(verse.verse) === index
                )
                const text =
                  verseObjects?.verseObjects && verseIndex !== -1
                    ? verseObjects.verseObjects[verseIndex].text
                    : ' '

                return (
                  <div className={`flex gap-2 ${text === ' ' ? 'mb-2' : ''}`} key={index}>
                    {index !== 0 && <sup className="mt-2">{index}</sup>}
                    <p>{text}</p>
                  </div>
                )
              })}
              {verseObjects?.verseObjects && (
                <div className="flex gap-2 mb-2">
                  {verseObjects.verseObjects.find((verse) => verse.verse === 200)?.text}
                </div>
              )}
            </>
          ) : (
            <>
              <p>{t('NoContent')}</p>
              {isCoordinatorAccess && (
                <div
                  className="flex gap-2
                  text-th-primary-200 hover:opacity-70 cursor-pointer"
                  onClick={() =>
                    push({
                      pathname: `/projects/${project?.code}`,
                      query: {
                        properties: bookid,
                        levels: true,
                      },
                    })
                  }
                >
                  <span>{t('CheckLinkResource')}</span>
                  <Gear className="w-6 min-w-[1.5rem]" />
                </div>
              )}
            </>
          )
        ) : (
          <div className="p-4 md:p-6 h-full animate-pulse">
            <div className="mb-4 h-2.5 w-1/4 bg-th-secondary-100 rounded-full"></div>
            {[...Array(22).keys()].map((el) => (
              <div key={el}>
                <div className="h-2 mb-4 bg-th-secondary-100 rounded-full"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Verses
