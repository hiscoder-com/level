import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { Disclosure, Combobox, Tab, Transition } from '@headlessui/react'

import ResumeInfo from './ResumeInfo'
import ChecksIcon from './BookList/ChecksIcon'
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
import Card from './Card'

function BookReader() {
  const { user } = useCurrentUser()
  const [reference, setReference] = useState()
  const {
    query: { code, bookid },
  } = useRouter()
  const [books] = useGetBooks({
    code,
  })
  const [project] = useProject({ code })

  const [chapters] = useGetChaptersTranslate({ code })

  const resource = useMemo(() => {
    if (reference?.checks) {
      const resource = reference?.checks?.url?.split('/')
      return {
        owner: resource[3],
        repo: resource[4],
        commit: resource[6],
        bookPath:
          project?.type === 'obs' ? './content' : './' + usfmFileNames[reference?.bookid],
      }
    }
  }, [project?.type, reference?.bookid, reference?.checks])
  const { isLoading, data: verseObjects } = useGetResource({
    config: {
      reference: { book: reference?.bookid, chapter: reference?.chapter },
      resource: resource || { owner: '', repo: '', commit: '', bookPath: '' },
    },
    url: `/api/git/${project?.type}`,
  })
  const verseObjectsToUse =
    verseObjects ||
    getVerseObjectsForBookAndChapter(chapters, reference?.bookid, reference?.chapter)
  useEffect(() => {
    if (bookid && books) {
      const book = books.find((book) => book.code === bookid)
      setReference((prev) => ({ ...prev, chapter: 1, bookid, checks: book.level_checks }))
    }
  }, [bookid, books])
  const createdNewTestamentBooks = useMemo(
    () =>
      books
        ? books
            .filter((book) =>
              Object.keys(newTestamentList).some(
                (nt) =>
                  nt === book.code &&
                  (book?.level_checks || checkBookCodeExists(book.code, chapters))
              )
            )
            .sort((a, b) => {
              return (
                Object.keys(newTestamentList).indexOf(a.code) -
                Object.keys(newTestamentList).indexOf(b.code)
              )
            })
        : [],
    [books, chapters]
  )
  const createdOldTestamentBooks = useMemo(
    () =>
      books
        ? books
            .filter((book) =>
              Object.keys(oldTestamentList).some(
                (ot) =>
                  ot === book.code &&
                  (book?.level_checks || checkBookCodeExists(book.code, chapters))
              )
            )
            .sort((a, b) => {
              return (
                Object.keys(oldTestamentList).indexOf(a.code) -
                Object.keys(oldTestamentList).indexOf(b.code)
              )
            })
        : [],

    [books, chapters]
  )
  return (
    <div className="flex flex-col-reverse xl:flex-row gap-7 mx-auto max-w-7xl pb-10">
      <div className="static xl:sticky top-7 flex flex-col md:flex-row xl:flex-col gap-7 w-full xl:w-1/3 self-start">
        <div className="hidden xl:block md:w-1/2 xl:w-full">
          <BookListReader
            books={
              project?.type === 'obs'
                ? [books]
                : [createdOldTestamentBooks, createdNewTestamentBooks]
            }
            setReference={setReference}
            reference={reference}
            project={project}
          />
        </div>
        <div className="w-full">
          <ResumeInfo project={project} user={user} />
        </div>
      </div>
      <div className="w-full xl:w-2/3">
        <div className="card flex flex-col gap-7 bg-th-secondary-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:gap-12 xl:hidden">
            <Link href={'/projects/' + project?.code} className="p-3">
              <Left className="w-5 h-5 stroke-th-primary-200 hover:opacity-70" />
            </Link>
            <Navigation
              books={
                project?.type === 'obs'
                  ? books
                  : [...createdOldTestamentBooks, ...createdNewTestamentBooks]
              }
              reference={reference}
              setReference={setReference}
            />
          </div>
          <Verses
            verseObjects={verseObjectsToUse}
            user={user}
            reference={reference}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default BookReader
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

function Navigation({ books, reference, setReference }) {
  const { query, replace } = useRouter()
  const [selectedBook, setSelectedBook] = useState({})
  const [queryCombobox, setQueryCombobox] = useState('')

  const { t } = useTranslation()
  useEffect(() => {
    if (books?.length) {
      setSelectedBook(books.find((book) => book.code === query.bookid))
    }
  }, [books, query.bookid])

  const prevChapter = useMemo(
    () => (reference?.chapter ? reference?.chapter - 1 : 0),
    [reference]
  )
  const nextChapter = useMemo(
    () => (reference?.chapter ? reference?.chapter + 1 : 2),
    [reference]
  )

  const isNextChapter = useMemo(
    () =>
      selectedBook?.chapters &&
      nextChapter <= Object.keys(selectedBook?.chapters || {}).length,
    [nextChapter, selectedBook?.chapters]
  )

  const filteredBooks =
    queryCombobox === ''
      ? books
      : books.filter((book) => {
          const bookString = `${t('books:' + book.code)}`.toLowerCase()
          return bookString.includes(queryCombobox.toLowerCase())
        })

  return (
    <div className="flex flex-wrap sm:flex-auto justify-center sm:justify-start gap-3 z-10">
      <button
        className={`flex justify-around items-center gap-1 w-2/5 sm:w-auto px-7 py-3 bg-th-secondary-100 rounded-3xl ${
          !prevChapter ? 'cursor-default' : 'bg-th-secondary-100 cursor-pointer'
        }
        }`}
        onClick={() =>
          prevChapter && setReference((prev) => ({ ...prev, chapter: prev.chapter - 1 }))
        }
      >
        <Down
          className={`w-5 h-5 rotate-90 ${
            !prevChapter ? 'stroke-th-secondary-300' : 'stroke-th-text-primary'
          }`}
        />
        <span className={`${prevChapter ? 'opacity-100' : 'opacity-0'}`}>
          {prevChapter}
        </span>
        <span
          className={`hidden sm:block ${prevChapter ? 'opacity-100' : 'opacity-0'}`}
        >{`${t('Chapter')}`}</span>
      </button>

      <Combobox
        as={'div'}
        value={selectedBook}
        onChange={setSelectedBook}
        className="order-1 sm:order-none"
        disabled={books?.length === 1}
      >
        {({ open }) => (
          <div className="relative text-th-text-primary">
            <div
              className={`relative bg-th-secondary-10 cursor-default overflow-hidden transition-all duration-100 ease-in-out ${
                open ? 'rounded-t-3xl' : 'rounded-3xl'
              }`}
            >
              <Combobox.Input
                className={`w-full min-w-[15rem] py-3 pl-6 pr-12 bg-th-secondary-100 outline-none ${
                  selectedBook && Object.keys(selectedBook)?.length
                    ? ''
                    : 'animate-pulse text-transparent'
                }`}
                displayValue={(book) => (book ? t('books:' + book.code) : '')}
                onChange={(event) => setQueryCombobox(event.target.value)}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 pr-5">
                {books?.length > 1 && <Down className="w-5 h-5 min-w-[1.5rem]" />}
              </Combobox.Button>
            </div>

            <Transition
              as={Fragment}
              leave="transition-all ease-in-out duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQueryCombobox('')}
            >
              <Combobox.Options className="absolute w-full max-h-[50vh] overflow-y-auto rounded-b-3xl bg-th-secondary-100 z-10">
                {filteredBooks.length === 0 && queryCombobox !== '' ? (
                  <div className="relative select-none px-6 py-2">
                    {t('NothingFound')}
                  </div>
                ) : (
                  filteredBooks.map((book) => (
                    <Combobox.Option
                      key={book?.id}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 px-6 ${
                          active ? 'bg-th-secondary-100' : ''
                        }`
                      }
                      value={book}
                      onClick={() =>
                        replace(
                          {
                            query: { ...query, bookid: book.code },
                          },
                          undefined,
                          { shallow: true }
                        )
                      }
                    >
                      {({ selected }) => (
                        <div
                          className={`${
                            selected ? 'opacity-70' : ''
                          } w-full py-1 hover:opacity-70 cursor-pointer`}
                        >
                          {t('books:' + book?.code)}
                        </div>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </div>
        )}
      </Combobox>

      <div
        className={`w-2/5 sm:w-auto px-7 py-3 bg-th-secondary-100 rounded-3xl ${
          !isNextChapter ? 'cursor-default' : 'cursor-pointer'
        }
        }`}
        onClick={() =>
          isNextChapter &&
          setReference((prev) => ({ ...prev, chapter: prev.chapter + 1 }))
        }
      >
        <div
          className={`flex justify-around items-center gap-1 ${
            selectedBook && Object.keys(selectedBook)?.length
              ? 'opacity-auto'
              : 'opacity-0'
          }`}
        >
          <span
            className={`${isNextChapter ? 'opacity-100' : 'opacity-0'}`}
          >{`${nextChapter}`}</span>
          <span
            className={`hidden sm:block ${isNextChapter ? 'opacity-100' : 'opacity-0'}`}
          >{`${t('Chapter')}`}</span>
          <Down
            className={`w-5 h-5 -rotate-90 ${
              isNextChapter ? 'stroke-th-text-primary' : 'stroke-th-secondary-300'
            }`}
          />
        </div>
      </div>
    </div>
  )
}

function BookListReader({ books, setReference, reference, project }) {
  const [createdOldTestamentBooks, createdNewTestamentBooks] = books
  const [currentBook, setCurrentBook] = useState(null)
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
  //TODO надо сделать скролл при нажатии на таб Ветхий завет или новый
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
