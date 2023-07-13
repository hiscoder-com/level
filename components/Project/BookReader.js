import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { Disclosure, Listbox, Tab } from '@headlessui/react'

import ResumeInfo from './ResumeInfo'
import ChecksIcon from './BookList/ChecksIcon'
import Breadcrumbs from 'components/Breadcrumbs'

import { useCurrentUser } from 'lib/UserContext'
import { useAccess, useGetBooks, useGetResource, useProject } from 'utils/hooks'
import { oldTestamentList, newTestamentList, usfmFileNames } from '/utils/config'

import Down from '/public/arrow-down.svg'
import Left from '/public/left.svg'
import Gear from '/public/gear.svg'

function BookReader() {
  const { user } = useCurrentUser()
  const [reference, setReference] = useState()
  const {
    query: { code, bookid },
  } = useRouter()
  const [books] = useGetBooks({
    token: user?.access_token,
    code,
  })
  const [project] = useProject({ token: user?.access_token, code })

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
                (nt) => nt === book.code && book?.level_checks
              )
            )
            .sort((a, b) => {
              return (
                Object.keys(newTestamentList).indexOf(a.code) -
                Object.keys(newTestamentList).indexOf(b.code)
              )
            })
        : [],
    [books]
  )
  const createdOldTestamentBooks = useMemo(
    () =>
      books
        ? books
            .filter((book) =>
              Object.keys(oldTestamentList).some(
                (ot) => ot === book.code && book?.level_checks
              )
            )
            .sort((a, b) => {
              return (
                Object.keys(oldTestamentList).indexOf(a.code) -
                Object.keys(oldTestamentList).indexOf(b.code)
              )
            })
        : [],
    [books]
  )
  //TODO в брифе неработает ссылка
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
        <div className="card flex flex-col gap-7">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:gap-12 xl:hidden">
            <Link href={'/projects/' + project?.code}>
              <Left className="w-5 h-5 hover:text-gray-500" />
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
            verseObjects={verseObjects}
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
    token: user?.access_token,
    user_id: user?.id,
    code,
  })
  const [project] = useProject({ token: user?.access_token, code })
  const { t } = useTranslation()

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
      <div className={`flex flex-col gap-2 ${!verseObjects ? 'h-screen' : ''}`}>
        {!isLoading ? (
          verseObjects ? (
            verseObjects.verseObjects?.map((verseObject) => (
              <div className="flex gap-2" key={verseObject.verse}>
                {verseObject.verse > 0 && verseObject.verse < 200 && (
                  <sup className="mt-2">{verseObject.verse}</sup>
                )}
                <p
                  className={
                    verseObject.verse === '0'
                      ? 'font-bold'
                      : '' || verseObject.verse === '200'
                      ? 'italic'
                      : ''
                  }
                >
                  {verseObject.text}
                </p>
              </div>
            ))
          ) : (
            <>
              <p>{t('NoContent')}</p>
              {isCoordinatorAccess && (
                <div
                  className="flex gap-2
                  text-cyan-700 hover:stroke-gray-500 hover:text-gray-500 cursor-pointer"
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
            <div className="mb-4 h-2.5 w-1/4 bg-gray-200 rounded-full"></div>
            {[...Array(22).keys()].map((el) => (
              <div key={el}>
                <div className="h-2 mb-4 bg-gray-200 rounded-full"></div>
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
  return (
    <div className="flex flex-wrap sm:flex-auto justify-center sm:justify-start gap-3 z-10">
      <button
        className={`flex justify-around items-center gap-1 w-2/5 sm:w-auto px-7 py-3 bg-slate-200 rounded-3xl cursor-pointer ${
          !prevChapter ? 'bg-gray-100 cursor-default' : 'bg-slate-200 cursor-pointer'
        }
        }`}
        onClick={() =>
          prevChapter && setReference((prev) => ({ ...prev, chapter: prev.chapter - 1 }))
        }
      >
        <Down className={`w-5 h-5 rotate-90 ${prevChapter ? '' : 'stroke-gray-400'}`} />
        <span className={`${prevChapter ? 'opacity-100' : 'opacity-0'}`}>
          {prevChapter}
        </span>
        <span
          className={`hidden sm:block ${prevChapter ? 'opacity-100' : 'opacity-0'}`}
        >{`${t('Chapter')}`}</span>
      </button>

      <Listbox
        as={'div'}
        value={selectedBook}
        onChange={setSelectedBook}
        className="order-1 sm:order-none"
        disabled={books?.length === 1}
      >
        {({ open }) => (
          <div className="relative">
            <Listbox.Button>
              <div
                className={`px-7 py-3 min-w-[15rem] w-1/3 sm:w-auto bg-slate-200 ${
                  !Object.keys(selectedBook)?.length ? 'animate-pulse' : ''
                } ${open ? 'rounded-t-2xl' : 'rounded-2xl '}`}
              >
                <div
                  className={`flex ${
                    books?.length > 1 ? 'justify-between' : 'justify-center'
                  } ${!Object.keys(selectedBook)?.length ? 'opacity-0' : 'opacity-auto'}`}
                >
                  <span>{t('books:' + selectedBook?.code)}</span>
                  {books?.length > 1 && <Down className="w-5 h-5 min-w-[1.5rem]" />}
                </div>
              </div>
            </Listbox.Button>
            <div className="flex justify-center">
              <Listbox.Options className="absolute w-full max-h-[50vh] bg-slate-200 overflow-y-scroll rounded-b-2xl">
                {books?.map((book) => (
                  <Listbox.Option
                    key={book?.id}
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
                          selected ? 'bg-slate-100' : 'bg-slate-200'
                        } w-full px-3 py-1 hover:bg-slate-100 cursor-pointer`}
                      >
                        {t('books:' + book?.code)}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </div>
        )}
      </Listbox>

      <div
        className={`w-2/5 sm:w-auto px-7 py-3 bg-slate-200 rounded-3xl cursor-pointer ${
          !isNextChapter ? 'cursor-default bg-gray-100' : 'cursor-pointer'
        }
        }`}
        onClick={() =>
          isNextChapter &&
          setReference((prev) => ({ ...prev, chapter: prev.chapter + 1 }))
        }
      >
        <div
          className={`flex justify-around gap-1 ${
            !Object.keys(selectedBook)?.length ? 'opacity-0' : 'opacity-auto'
          }`}
        >
          <span
            className={`${isNextChapter ? 'opacity-100' : 'opacity-0'}`}
          >{`${nextChapter}`}</span>
          <span
            className={`hidden sm:block ${isNextChapter ? 'opacity-100' : 'opacity-0'}`}
          >{`${t('Chapter')}`}</span>
          <Down
            className={`w-5 h-5 -rotate-90 ${isNextChapter ? '' : 'stroke-gray-400'}`}
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

  const defaultIndex = useMemo(
    () =>
      [createdNewTestamentBooks, createdOldTestamentBooks]?.findIndex((list) =>
        list?.find((el) => el.code === query.bookid)
      ),
    [createdNewTestamentBooks, createdOldTestamentBooks, query.bookid]
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
    <div className="card flex flex-col gap-7">
      <Tab.Group defaultIndex={defaultIndex}>
        <Tab.List
          as={'div'}
          className={`grid grid-cols-2 gap-3 w-full font-bold border-b border-slate-900 ${
            project?.type === 'obs' ? 'hidden' : 'flex'
          }`}
        >
          <Tab className={({ selected }) => (selected ? 'tab-active' : 'tab')}>
            {t('NewTestament')}
          </Tab>
          <Tab className={({ selected }) => (selected ? 'tab-active' : 'tab')}>
            {t('OldTestament')}
          </Tab>
        </Tab.List>
        <Tab.Panels className="text-sm font-bold">
          {[createdNewTestamentBooks, createdOldTestamentBooks].map((list, idx) => (
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
                          className={`flex justify-between items-center py-2 w-full hover:text-gray-400 ${
                            !open ? 'border-b border-gray-400' : ''
                          }`}
                        >
                          <div className="flex items-center gap-4">
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
                          <div className="flex flex-wrap gap-4 pb-5 w-full border-b border-gray-400">
                            {[...Array(Object.keys(book.chapters).length).keys()]
                              .map((el) => el + 1)
                              .map((index) => (
                                <div
                                  className={`flex justify-center items-center w-10 h-10 bg-slate-200 rounded-md cursor-pointer hover:bg-slate-100 ${
                                    index === reference?.chapter
                                      ? 'cursor-default bg-slate-100'
                                      : 'bg-slate-200 cursor-pointer '
                                  }`}
                                  key={index}
                                  onClick={() =>
                                    setReference((prev) => ({ ...prev, chapter: index }))
                                  }
                                >
                                  {index}
                                </div>
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
  )
}
