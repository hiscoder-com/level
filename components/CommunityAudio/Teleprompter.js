import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Breadcrumbs from 'components/Breadcrumbs'

import { useAccess, useGetBooks, useProject } from 'utils/hooks'
import { getVerseCount, getVerseCountOBS } from 'utils/helper'

function Teleprompter({
  verseObjects,
  user,
  reference,
  isLoading,
  isRecording,
  isPaused,
  stopRecording,
  textProperties: { fontSize, textSpeed },
}) {
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

  const [isPlaying, setIsPlaying] = useState(false)
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const scrollPositionRef = useRef(0)

  const verseCount = useMemo(() => {
    if (project?.type === 'obs') {
      return getVerseCountOBS(books, reference?.chapter)
    } else {
      return getVerseCount(books, bookid, reference?.chapter)
    }
  }, [books, project?.type, bookid, reference?.chapter])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    scrollPositionRef.current = 0
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  const LoadingSection = () => (
    <div className="p-4 md:p-6 h-full animate-pulse">
      <div className="mb-4 h-2.5 w-1/4 bg-th-secondary-100 rounded-full"></div>
      {[...Array(22).keys()].map((el) => (
        <div key={el}>
          <div className="h-2 mb-4 bg-th-secondary-100 rounded-full"></div>
        </div>
      ))}
    </div>
  )

  const NoContentSection = () => (
    <>
      <p>{t('NoContent')}</p>
      {isCoordinatorAccess && (
        <div
          className="flex gap-2 text-th-primary-200 hover:opacity-70 cursor-pointer"
          onClick={() =>
            push({
              pathname: `/projects/${project?.code}`,
              query: { properties: bookid, levels: true },
            })
          }
        >
          <span>{t('CheckLinkResource')}</span>
        </div>
      )}
    </>
  )

  useEffect(() => {
    if (isRecording && !isPaused) {
      setIsPlaying(true)
    }
    if (isPaused) {
      setIsPlaying(false)
    }

    if (!isRecording) {
      handleReset()
    }
  }, [fontSize, textSpeed, isRecording, isPaused])

  useEffect(() => {
    let previousTimestamp = null

    const animate = (timestamp) => {
      if (!previousTimestamp) previousTimestamp = timestamp
      if (!containerRef.current) return

      const elapsed = timestamp - previousTimestamp
      const speed = textSpeed * 0.004

      scrollPositionRef.current += elapsed * speed
      containerRef.current.scrollTop = scrollPositionRef.current

      previousTimestamp = timestamp

      if (
        containerRef.current.scrollTop >=
        containerRef.current.scrollHeight - containerRef.current.clientHeight
      ) {
        stopRecording()
        setIsPlaying(false)
        handleReset()
        return
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, textSpeed])

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
      <div className="relative max-h-[70vh]">
        <div className="absolute top-0 left-0 right-0 h-12 bg-gray-500 z-10 opacity-20" />

        <div
          ref={containerRef}
          className="relative max-h-[70vh] overflow-y-auto scrollbar-hide"
          dir={project?.is_rtl ? 'rtl' : 'ltr'}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: `${fontSize * 1.5}px`,
          }}
        >
          {!isLoading ? (
            verseObjects ? (
              <div className="verse-container">
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
                      className={`flex gap-2 p-2 ${text === ' ' ? 'mb-2' : ''}
                        bg-white verse-line`}
                      key={index}
                    >
                      {index !== 0 && <sup className="mt-2">{index}</sup>}
                      <p>{text}</p>
                    </div>
                  )
                })}
                {verseObjects?.verseObjects && (
                  <div className="flex gap-2 mb-2 p-2 bg-white">
                    {verseObjects.verseObjects.find((verse) => verse.verse === 200)?.text}
                  </div>
                )}
              </div>
            ) : (
              <NoContentSection />
            )
          ) : (
            <LoadingSection />
          )}

          <div style={{ height: 'calc(100vh - 196px)' }} />
        </div>
      </div>
    </div>
  )
}

export default Teleprompter
