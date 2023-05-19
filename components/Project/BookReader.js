import { useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { Disclosure, Tab } from '@headlessui/react'

import ResumeInfo from './ResumeInfo'
import ChecksIcon from './BookList/ChecksIcon'
import Breadcrumbs from 'components/Breadcrumbs'

import { useCurrentUser } from 'lib/UserContext'
import { useAccess, useGetBooks, useGetResource, useProject } from 'utils/hooks'
import { oldTestamentList, newTestamentList, usfmFileNames } from '/utils/config'
import Down from '/public/arrow-down.svg'

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

  const resource = useMemo(() => {
    if (reference?.checks) {
      const resource = reference?.checks?.url?.split('/')
      return {
        owner: resource[3],
        repo: resource[4],
        commit: resource[6],
        bookPath: '//' + usfmFileNames[reference?.bookid],
      }
    }
  }, [reference?.bookid, reference?.checks])
  const { isLoading, data: verseObjects } = useGetResource({
    config: {
      reference: { book: reference?.bookid, chapter: reference?.chapter },
      resource: resource || { owner: '', repo: '', commit: '', bookPath: '' },
    },
    url: '/api/git/bible',
  })
  useEffect(() => {
    if (bookid && books) {
      const book = books.find((book) => book.code === bookid)
      setReference((prev) => ({ ...prev, chapter: 1, bookid, checks: book.checks }))
    }
  }, [bookid, books])
  const [project] = useProject({ token: user?.access_token, code })
  return (
    <div className="flex flex-col-reverse xl:flex-row gap-7 mx-auto max-w-7xl pb-10">
      <div className="static xl:sticky top-7 flex flex-col md:flex-row xl:flex-col gap-7 w-full xl:w-1/3 self-start">
        <div className="w-full md:w-1/2 xl:w-full">
          <BookListReader
            books={books}
            setReference={setReference}
            reference={reference}
          />
        </div>
        <div className="w-full md:w-1/2 xl:w-full">
          <ResumeInfo project={project} user={user} />
        </div>
      </div>
      <div className="w-full xl:w-2/3">
        <div className="card">
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
    <div className="flex flex-col gap-7">
      <Breadcrumbs
        links={
          reference && [
            { title: project?.title, href: '/projects/' + project?.code },
            { title: t('books:' + bookid) + ' ' + reference?.chapter },
          ]
        }
      />
      <div className={`flex flex-col gap-2 ${!verseObjects ? 'h-screen' : ''}`}>
        {!isLoading ? (
          verseObjects ? (
            verseObjects.verseObjects?.map((verseObject) => (
              <div className="flex gap-2" key={verseObject.verse}>
                <sup className="mt-2">{verseObject.verse}</sup>
                <p>{verseObject.text}</p>
              </div>
            ))
          ) : (
            <>
              <p>{t('NoContent')}</p>
              {isCoordinatorAccess && (
                <>
                  <p>{t('CheckLink')}</p>{' '}
                  <Link
                    href={`/projects/${
                      project?.code
                    }?properties=${bookid}&levels=${true}`}
                  >
                    <a>ссылка</a>
                  </Link>
                </>
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

function BookListReader({ books, setReference, reference }) {
  const { query, replace } = useRouter()
  const { t } = useTranslation('books')
  const refs = useRef([])
  const handleClick = (index) => {
    refs.current.map((closeFunction, refIndex) => {
      if (refIndex !== index) {
        closeFunction()
      }
    })
  }

  const createdNewTestamentBooks = useMemo(
    () =>
      books
        ?.filter((book) =>
          Object.keys(newTestamentList).some((nt) => nt === book.code && book?.checks)
        )
        .sort((a, b) => {
          return (
            Object.keys(newTestamentList).indexOf(a.code) -
            Object.keys(newTestamentList).indexOf(b.code)
          )
        })
        .map((book) => ({ ...book, chapterCount: newTestamentList[book.code] })),
    [books]
  )
  const createdOldTestamentBooks = useMemo(
    () =>
      books
        ?.filter((book) =>
          Object.keys(oldTestamentList).some((nt) => nt === book.code && book?.checks)
        )
        .sort((a, b) => {
          return (
            Object.keys(oldTestamentList).indexOf(a.code) -
            Object.keys(oldTestamentList).indexOf(b.code)
          )
        })
        .map((book) => ({ ...book, chapterCount: oldTestamentList[book.code] })),
    [books]
  )
  const defaultIndex = useMemo(
    () =>
      [createdNewTestamentBooks, createdOldTestamentBooks]?.findIndex((list) =>
        list?.find((el) => el.code === query.bookid)
      ),
    [createdNewTestamentBooks, createdOldTestamentBooks, query.bookid]
  )
  return (
    <div className="card flex flex-col gap-7">
      <Tab.Group defaultIndex={defaultIndex}>
        <Tab.List className="flex gap-3 w-full font-bold border-b border-slate-900">
          <Tab className={({ selected }) => (selected ? 'tab-active' : 'tab')}>
            New Testament
          </Tab>
          <Tab className={({ selected }) => (selected ? 'tab-active' : 'tab')}>
            Old Testament
          </Tab>
        </Tab.List>
        <Tab.Panels className="text-sm font-bold">
          {[createdNewTestamentBooks, createdOldTestamentBooks].map((list, idx) => (
            <Tab.Panel key={idx}>
              {list?.map((book, index) => (
                <Disclosure key={book.code} defaultOpen={query?.bookid === book.code}>
                  {({ open, close }) => {
                    return (
                      <>
                        <Disclosure.Button
                          ref={(el) => (refs.current[index] = close)}
                          onClick={() => {
                            handleClick(index)
                            replace(
                              {
                                query: { ...query, bookid: book.code },
                              },
                              undefined,
                              { shallow: true }
                            )
                          }}
                          className={`flex justify-between items-center pb-5 w-full ${
                            !open ? 'border-b border-gray-400' : ''
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <ChecksIcon levelCheck={book?.checks} />
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
                            {[...Array(book.chapterCount).keys()]
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
