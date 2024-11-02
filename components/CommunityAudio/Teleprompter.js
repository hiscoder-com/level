import { useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Breadcrumbs from 'components/Breadcrumbs'

import { useAccess, useGetBooks, useProject } from 'utils/hooks'

import { getVerseCount, getVerseCountOBS } from 'utils/helper'

import Gear from '/public/gear.svg'

function Teleprompter({
  verseObjects,
  user,
  reference,
  isLoading,
  fontSize,
  textSpeed,
  isRecording,
  isPaused,
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeVerseIndex, setActiveVerseIndex] = useState(1)

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

  const containerRef = useRef(null)

  const scrollSpeed = useMemo(() => {
    return 20 + (textSpeed * 180) / 100
  }, [textSpeed])

  const handleReset = () => {
    setIsPlaying(false)
    setActiveVerseIndex(1)
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }

  useEffect(() => {
    if (isRecording) {
      if (isPaused) {
        setIsPlaying(false)
      } else {
        setIsPlaying(true)
      }
    } else {
      handleReset()
    }
  }, [isRecording, isPaused])

  useEffect(() => {
    if (!isPlaying || !containerRef.current) return

    const container = containerRef.current
    const verses = container.querySelectorAll('.verse-line')
    let currentIndex = activeVerseIndex

    const scrollInterval = setInterval(() => {
      if (currentIndex >= verses.length) {
        setIsPlaying(false)
        clearInterval(scrollInterval)
        handleReset()
        return
      }

      const verse = verses[currentIndex]
      const verseTop = verse.offsetTop - container.offsetTop

      container.scrollTo({
        top: verseTop - 100,
        behavior: 'smooth',
      })

      setActiveVerseIndex(currentIndex)
      currentIndex++
    }, (1000 * 60) / scrollSpeed)

    return () => clearInterval(scrollInterval)
  }, [isPlaying, scrollSpeed, activeVerseIndex])

  return (
    <div className="flex flex-col gap-5">
      <div className="hidden xl:block px-8 pt-5">
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
        <div className="text-xl font-bold px-8">{`${t('books:' + bookid)} ${
          reference?.chapter
        }`}</div>
      )}

      <div
        ref={containerRef}
        className={`flex flex-col gap-4 ${
          !verseObjects ? 'h-screen' : 'max-h-[70vh] overflow-y-auto'
        }`}
        dir={project?.is_rtl ? 'rtl' : 'ltr'}
        style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.5}px` }}
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
                  <div
                    className={`verse-line flex gap-2 px-5 ${
                      index !== 0
                        ? fontSize > 26
                          ? fontSize > 32
                            ? 'pt-10'
                            : 'pt-6'
                          : 'pt-2'
                        : ''
                    }
                      ${activeVerseIndex === index ? 'bg-gray-200' : ''}`}
                    key={index}
                  >
                    {index !== 0 && <sup className="mt-2">{index}</sup>}
                    <p className="py-2">{text}</p>
                  </div>
                )
              })}
              {verseObjects?.verseObjects && (
                <div className="verse-line flex gap-2 mb-2">
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

export default Teleprompter
