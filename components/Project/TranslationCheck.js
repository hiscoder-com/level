import React, { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import axios from 'axios'
import Modal from 'components/Modal'
import { useCurrentUser } from 'lib/UserContext'
import { useGetBooks, useProject } from 'utils/hooks'
import ListBox from 'components/ListBox'
import { t } from 'i18next'
import Down from 'public/folder-arrow-down.svg'
import { Disclosure } from '@headlessui/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Loading from 'public/progress.svg'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import LeftArrow from 'public/left.svg'

function TranslationCheck({ project, mutate }) {
  const {
    replace,
    query,
    query: { code, setting, book, check, checkBook, checkProject },
  } = useRouter()

  const { t } = useTranslation('books')
  // const { user, getUser } = useCurrentUser()
  const [isAuthComcheck, setIsAuthComcheck] = useState(false)

  useEffect(() => {
    if (!isAuthComcheck && project?.comcheck_token) {
      setIsAuthComcheck(true)
    }
  }, [isAuthComcheck, project?.comcheck_token])

  const checkRender = useMemo(
    () =>
      !check ? (
        <Checks
          user={project}
          project={project}
          projectName={project.name}
          bookName={book}
        />
      ) : (
        <Check check={check} book={checkBook} project={checkProject} />
      ),
    [check, project, book, checkBook, checkProject]
  )

  return (
    <div className="flex flex-col py-7 px-10  rounded-b-2xl bg-th-secondary-10">
      {isAuthComcheck ? (
        checkRender
      ) : (
        <Auth projectId={project.id} mutateProject={mutate} />
      )}
    </div>
  )
}

export default TranslationCheck

function Auth({ projectId }) {
  const {
    query: { code },
  } = useRouter()
  const [project, { mutate: mutateProject }] = useProject({ code })
  const handleSubmit = (e) => {
    e.preventDefault()
    axios
      .post('/api/comcheck/save_token', {
        token: e.target[0].value,
        project_id: projectId,
      })
      .then(() => {
        mutateProject()
      })
  }
  return (
    <form onSubmit={handleSubmit}>
      <p className="mb-4">
        You are not logged in to the Comcheck resource. Enter your token.
      </p>
      <div className="flex gap-3 pb-20">
        <input className="input-primary " />
        <button type="submit" className="btn-primary">
          Save
        </button>
      </div>
      <div className="flex gap-3">
        <p>If you do not have a token, you can get it on the website </p>
        <span>
          <Link
            target="_blank"
            href="https://community-check.netlify.app/"
            className="text-th-primary-100"
          >
            community-check.netlify.app
          </Link>
        </span>
      </div>
    </form>
  )
}

function Checks({ user, project, projectName, bookName }) {
  const { replace } = useRouter()
  const { t } = useTranslation('books')
  const [isOpen, setIsOpen] = useState(false)
  const [books, { mutate: mutateBooks }] = useGetBooks({
    code: project?.code,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentBook, setCurrentBook] = useState(null)
  const [checks, setChecks] = useState({})
  const getProject = async (book) => {
    setIsLoading(true)
    axios
      .get('/api/comcheck/get_books', {
        params: {
          project_id: project?.id,
          book_code: book,
        },
      })
      .then((res) => {
        setChecks((prev) => {
          return { ...prev, [book]: res.data }
        })
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }
  const handleSubmit = (e) => {
    e.preventDefault()

    axios
      .post('/api/comcheck/create_check', {
        projectId: project.id,
        checkName: e.target[0].value,
        bookName: currentBook.code,
      })
      .then(() => {
        getProject(currentBook.code)
        setIsOpen(false)
      })
  }
  return (
    <div>
      <div className="relative overflow-x-auto border sm:rounded-lg">
        {books?.map((book) => (
          <Disclosure key={book.id}>
            <div className=" px-6 py-4 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <Disclosure.Button
                className="flex items-center  justify-between text-th-text-primary w-full"
                onClick={() => {
                  setCurrentBook(book)
                  getProject(book.code)
                }}
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t('books:' + book.code)}
                  </p>
                </div>

                <Down className="w-6 min-w-[1.5rem] cursor-pointer" />
              </Disclosure.Button>
              <Disclosure.Panel className=" flex flex-col  w-full relative">
                {isLoading && currentBook?.code === book.code ? (
                  <Loading className="progress-custom-colors absolute mx-auto my-auto inset-0 w-6 animate-spin stroke-th-primary-100" />
                ) : (
                  <div className="relative overflow-x-auto py-10">
                    {checks[book.code]?.checks?.length > 0 && (
                      <table className="w-full py-10 text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                          <tr>
                            <th scope="col" className="px-6 py-3">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {checks[book.code]?.checks?.map((check) => (
                            <tr
                              key={check.id}
                              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                            >
                              <th
                                scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-th-primary-100"
                              >
                                <button
                                  onClick={() =>
                                    replace(
                                      {
                                        pathname: `/projects/${project.code}/edit`,
                                        query: {
                                          setting: 'comcheck',
                                          check: check.id,
                                          checkBook: checks[book.code].book,
                                          checkProject: checks[book.code].project,
                                        },
                                      },
                                      undefined,
                                      { shallow: true }
                                    )
                                  }
                                >
                                  {check.name}
                                </button>
                              </th>
                              <td
                                scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                              >
                                {new Date(
                                  Date.parse(check.created_at)
                                ).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
                <div className=" bottom-0 flex justify-end w-full">
                  <button
                    className="btn-primary mt-20"
                    onClick={() => {
                      setIsOpen(true)
                      setCurrentBook(book)
                    }}
                  >
                    Create a check
                  </button>
                </div>
              </Disclosure.Panel>
            </div>
          </Disclosure>
        ))}
      </div>

      <br />
      <br />
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg"></div>
      <br />

      <Modal
        className={{
          main: 'z-50 relative',
          dialogTitle: 'text-center text-2xl font-medium leading-6',
          dialogPanel:
            'w-full max-w-md p-6 align-middle transform shadow-xl transition-all bg-th-primary-100 text-th-text-secondary-100 rounded-3xl',
          transitionChild: 'fixed inset-0 bg-opacity-25 backdrop-brightness-90',
          content:
            'inset-0 fixed flex items-center justify-center p-4 min-h-full overflow-y-auto',
        }}
        title="Создание проверки"
        isOpen={isOpen}
        closeHandle={() => setIsOpen(false)}
      >
        <form className="py-10" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <div>Название:</div>
            <input className="input-primary" />
          </div>
          {/* <div>Название:</div>
          <ListBox
            options={books?.map((book) => ({
              label: t('books:' + book.code),
              value: book.code,
            }))}
            setSelectedOption={setSelectedOption}
            selectedOption={selectedOption}
          /> */}
          <br />

          <button type="submit" className="btn-primary">
            Создать
          </button>
        </form>
      </Modal>
    </div>
  )
}

function Check({ check: checkId, book, project }) {
  const { replace } = useRouter()
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16))
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 16))
  const [materialLink, setMaterialLink] = useState('')
  const [checkName, setCheckName] = useState('')
  const [inspectorName, setInspectorName] = useState('')
  const [check, setCheck] = useState(null)
  const {
    query: { code },
  } = useRouter()
  const [currentProject] = useProject({ code })
  useEffect(() => {
    try {
      const getCheck = async () => {
        const checkInfo = await axios.get(`/api/comcheck/checks/${checkId}`, {
          params: { code, book, project },
        })
        setCheck(checkInfo.data)
      }
      getCheck()
    } catch (error) {
      console.log(error)
    }
  }, [book, checkId, code, project])

  useEffect(() => {
    if (check) {
      const currentDate = new Date().toISOString().slice(0, 16)
      const formattedStartedDate = check.started_at
        ? new Date(check.started_at).toISOString().slice(0, 16)
        : currentDate
      const formattedFinishedDate = check.finished_at
        ? new Date(check.finished_at).toISOString().slice(0, 16)
        : currentDate

      setStartDate(formattedStartedDate)
      setEndDate(formattedFinishedDate)

      setMaterialLink(check.material_link || '')
      setCheckName(check.name)
    }
  }, [check])

  const updateContent = async () => {
    if (materialLink) {
      try {
        await axios.post('/api/comcheck/update_content', {
          code,
          materialLink: materialLink,
          checkId: checkId,
          projectId: project,
          book: book,
        })
        toast.success(t('updatedContent'))
      } catch (error) {
        console.error(error)
        toast.error(error.message)
      }
    } else {
      toast.error(t('provideLink'))
    }
  }

  const updateCheckInfo = async () => {
    try {
      console.log({ project, book, checkId, startDate, endDate, checkName })
      const response = await axios({
        method: 'post',
        url: `/api/comcheck/update_check`,
        data: {
          projectId: project,
          code,
          book,
          checkId,
          startDate,
          endDate,
          checkName,
        },
      })
      setCheck(response.data)
      toast.success(t('updatedInformation'))
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }
  console.log(check)

  return (
    <div>
      <LeftArrow
        className="mb-4 w-6 text-th-primary-100 hover:opacity-75 cursor-pointer"
        onClick={() =>
          replace(
            {
              pathname: `/projects/${currentProject.code}/edit`,
              query: {
                setting: 'comcheck',
              },
            },
            undefined,
            { shallow: true }
          )
        }
      />
      <div className="mb-4 flex gap-2 w-full">
        <div className="flex justify-between gap-2 w-2/3">
          <label className="block font-medium text-gray-700">{t('name')}</label>
          <input
            type="text"
            value={checkName}
            onChange={(e) => setCheckName(e.target.value)}
            className="input-primary"
          />
          <label className="block font-medium text-gray-700">{t('startingDate')}</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-primary"
          />
          <label className="block font-medium text-gray-700">{t('expirationDate')}</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-primary"
          />
        </div>
        <button className=" btn-primary w-fit" onClick={updateCheckInfo}>
          {'Update Information'}
        </button>
      </div>
      <div className="mb-4 flex gap-2">
        <label className="mt-6 block font-medium text-gray-700">{t('provideLink')}</label>
        <input
          type="text"
          value={materialLink}
          onChange={(e) => setMaterialLink(e.target.value)}
          placeholder={t('linkResource')}
          className="input-primary !w-1/3"
        />
        <button className="btn-primary w-fit" onClick={updateContent}>
          {'Update content'}
        </button>
      </div>
      {checkName !== '' && (
        <div className="flex my-4">
          <Link
            target="_blank"
            href={`https://community-check.netlify.app/checks/${check.id}/1`}
          >{`https://community-check.netlify.app/checks/${check.id}/1`}</Link>
        </div>
      )}
    </div>
  )
}
