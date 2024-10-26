import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { Disclosure, Tab } from '@headlessui/react'

import ChecksIcon from 'components/Project/BookList/ChecksIcon'
import Card from 'components/Project/Card'
import { useGetChaptersTranslate } from 'utils/hooks'

import { checkChapterVersesExist } from 'utils/helper'

import Down from '/public/arrow-down.svg'

function BookListReader({ books, setReference, reference, project }) {
  const [currentBook, setCurrentBook] = useState(null)
  const [createdOldTestamentBooks, createdNewTestamentBooks] = books
  const { query, replace } = useRouter()
  const { t } = useTranslation(['common', 'books'])
  const refs = useRef([])
  const {
    query: { code, bookid },
  } = useRouter()
  const [chapters] = useGetChaptersTranslate({ code })

  const scrollRefs = useRef({})
  const handleClose = (index) => {
    refs.current.map((closeFunction, refIndex) => {
      if (refIndex !== index) {
        closeFunction()
      }
    })
  }

  const handleScroll = (bookid) => {
    if (scrollRefs?.current && Object.keys(scrollRefs?.current).length) {
      verseRef(scrollRefs.current[bookid])
    }
  }

  const scrollTo = (currentBook, position) => {
    let offset = 0
    const top = currentBook.offsetTop - 95
    switch (position) {
      case 'center':
        offset = currentBook.clientHeight / 2 - currentBook.parentNode.clientHeight / 2
        break
      case 'top':
      default:
        break
    }

    currentBook.parentNode.scrollTo({ left: 0, top: top + offset, behavior: 'smooth' })
  }

  const defaultIndex = useMemo(() => {
    const index = [createdNewTestamentBooks, createdOldTestamentBooks]?.findIndex(
      (list) => list?.find((el) => el.code === query.bookid)
    )

    return index === -1 ? 0 : index
  }, [createdNewTestamentBooks, createdOldTestamentBooks, query.bookid])

  const tabs = useMemo(
    () =>
      project?.type === 'obs' ? ['OpenBibleStories'] : ['NewTestament', 'OldTestament'],
    [project?.type]
  )

  const verseRef = useCallback((node) => {
    if (node !== null) {
      setCurrentBook(node)
    }
  }, [])

  useEffect(() => {
    if (currentBook) {
      scrollTo(currentBook, 'top')
    }
  }, [currentBook])

  useEffect(() => {
    if (reference?.bookid) {
      handleScroll(reference.bookid)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference?.bookid])
  return (
    <Card>
      <div className="flex flex-col gap-7 bg-th-secondary-10">
        <Tab.Group defaultIndex={defaultIndex}>
          <Tab.List className="flex p-1 w-full -mt-6 bg-th-secondary-10 border border-th-secondary-300 rounded-3xl shadow-md">
            {tabs.map((tab) => (
              <Tab as={Fragment} key={tab}>
                {({ selected }) => (
                  <div
                    className={`p-2 w-full text-center rounded-3xl cursor-pointer ${
                      selected ? 'bg-th-primary-100 text-th-text-secondary-100' : ''
                    }
                      `}
                  >
                    {t(tab)}
                  </div>
                )}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="text-sm font-bold">
            {[
              ...(createdNewTestamentBooks !== undefined
                ? [createdNewTestamentBooks]
                : []),
              ...(createdOldTestamentBooks !== undefined
                ? [createdOldTestamentBooks]
                : []),
            ].map((list, idx) => (
              <Tab.Panel key={idx} className="pr-4 max-h-[70vh] overflow-y-scroll">
                {list?.map((book, index) => (
                  <Disclosure
                    as={'div'}
                    key={book.code}
                    defaultOpen={query?.bookid === book.code}
                    ref={(ref) => (scrollRefs.current[book.code] = ref)}
                  >
                    {({ open, close }) => {
                      return (
                        <>
                          <Disclosure.Button
                            ref={() => (refs.current[index] = close)}
                            onClick={() => {
                              handleClose(index)
                              replace(
                                {
                                  query: { ...query, bookid: book.code },
                                },
                                undefined,
                                { shallow: true }
                              )
                            }}
                            className={`flex justify-between items-center py-2 w-full hover:opacity-70 ${
                              !open ? 'border-b border-th-secondary-300' : ''
                            }`}
                          >
                            <div className="flex items-center gap-4 text-base">
                              <ChecksIcon levelCheck={book?.level_checks} />
                              <div>{t('books:' + book.code)}</div>
                            </div>
                            <Down
                              className={`w-6 max-w-[1.5rem] ${
                                open ? 'rotate-180 transform' : ''
                              }`}
                            />
                          </Disclosure.Button>
                          <Disclosure.Panel>
                            <div className="flex flex-wrap gap-4 pb-5 w-full border-b border-th-secondary-300">
                              {[...Array(Object.keys(book.chapters).length).keys()]
                                .map((el) => el + 1)
                                .map((index) => (
                                  <button
                                    disabled={
                                      !checkChapterVersesExist(
                                        book.code,
                                        index,
                                        chapters
                                      ) && !reference?.checks
                                    }
                                    className={`flex justify-center items-center w-10 h-10 rounded-md ${
                                      checkChapterVersesExist(
                                        book.code,
                                        index,
                                        chapters
                                      ) || reference?.checks
                                        ? 'cursor-pointer bg-th-primary-100'
                                        : 'cursor-default bg-th-secondary-200 disabled text-th-text-secondary-100 rounded-md'
                                    } ${
                                      index === reference?.chapter
                                        ? 'cursor-default bg-th-primary-100 text-th-text-secondary-100 rounded-md'
                                        : checkChapterVersesExist(
                                            book.code,
                                            index,
                                            chapters
                                          ) || reference?.checks
                                        ? 'hover:opacity-70 bg-th-secondary-200'
                                        : ''
                                    }`}
                                    key={index}
                                    onClick={() =>
                                      setReference((prev) => ({
                                        ...prev,
                                        chapter: index,
                                      }))
                                    }
                                  >
                                    {index}
                                  </button>
                                ))}
                            </div>
                          </Disclosure.Panel>
                        </>
                      )
                    }}
                  </Disclosure>
                ))}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Card>
  )
}

export default BookListReader
