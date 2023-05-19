import { useEffect, useMemo, useState } from 'react'

import axios from 'axios'

import { useTranslation } from 'next-i18next'

import toast, { Toaster } from 'react-hot-toast'
import Property from './Property'
import Breadcrumbs from 'components/Breadcrumbs'
import { Combobox, Switch, Tab } from '@headlessui/react'
import { useRouter } from 'next/router'
import Reader from '/public/dictionary.svg'
import Spinner from '/public/spinner.svg'

function BookProperties({ project, user, bookCode, type, mutateBooks, books }) {
  const { query } = useRouter()
  const { t } = useTranslation()
  const book = useMemo(() => books?.find((el) => el.code === bookCode), [bookCode, books])
  const [properties, setProperties] = useState()
  useEffect(() => {
    if (book?.properties) {
      setProperties(book?.properties)
    }
  }, [book?.properties])

  const updateProperty = (text, property) => {
    setProperties((prev) => {
      if (type !== 'obs') {
        return {
          ...prev,
          scripture: { ...prev.scripture, [property]: text },
        }
      } else {
        return {
          ...prev,
          obs: { ...prev.obs, [property]: text },
        }
      }
    })
  }

  const renderProperties =
    properties &&
    Object.entries(type !== 'obs' ? properties?.scripture : properties?.obs)?.map(
      ([property, content], index) => (
        <Property
          t={t}
          key={index}
          property={property}
          content={content}
          type={type}
          updateProperty={updateProperty}
        />
      )
    )
  const handleSave = () => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .put(`/api/book_properties/${book.id}`, {
        properties,
        project_id: project?.id,
        user_id: user?.id,
      })

      .then(() => {
        toast.success(t('SaveSuccess'))
        mutateBooks()
      })
      .catch((err) => {
        toast.error(t('SaveFailed'))
        console.log(err)
      })
  }

  return (
    <div className="flex flex-col gap-7 w-full">
      <Breadcrumbs
        links={[
          { title: project?.title, href: '/projects/' + project?.code },
          { title: t('books:' + book?.code) },
        ]}
        full
      />

      <Tab.Group defaultIndex={query?.levels ? 1 : 0}>
        <Tab.List className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-4 gap-4 mt-2 font-bold text-center border-b border-darkBlue">
          <Tab className={({ selected }) => (selected ? 'tab-active' : 'tab')}>
            {t('Properties')}
          </Tab>
          <Tab className={({ selected }) => (selected ? 'tab-active' : 'tab')}>
            {t('LevelTranslationChecks')}
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <div className="card flex flex-col py-7">
              <div className="flex flex-col gap-4">{renderProperties}</div>
              <button className="btn-primary mt-7 w-fit" onClick={handleSave}>
                {t('Save')}
              </button>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <LevelChecks t={t} book={book} />
          </Tab.Panel>
          <Tab.Panel></Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <Toaster />
    </div>
  )
}
export default BookProperties

function LevelChecks({ t, book }) {
  const [orgRepos, setOrgRepos] = useState([])
  const [translationLink, setTranslationLink] = useState()
  const { push } = useRouter()
  const [isHandleAddingLink, setIsHandleAddingLink] = useState(true)
  const classInput =
    'p-2 w-full rounded-lg bg-white text-slate-900 border border-cyan-600  focus:border-slate-900 focus:outline-none disabled:border-gray-300 disabled:placeholder-gray-300'
  const handleSaveLink = () => {}
  const [owner, setOwner] = useState('')

  useEffect(() => {
    if (book?.checks) {
      setTranslationLink(book?.checks)
    }
  }, [book])

  const [selectedRepo, setSelectedRepo] = useState()
  const [selectedBranch, setSelectedBranch] = useState()

  const [query, setQuery] = useState('')
  const [queryBranches, setQueryBranches] = useState('')
  const [branches, setBranches] = useState([])

  const [staticOptions, setStaticOptions] = useState(false)
  const [staticOptionsBranches, setStaticOptionsBranches] = useState(false)

  let isLoading = false

  const handleSearch = () => {
    setSelectedBranch('')
    setSelectedRepo('')
    setStaticOptions(false)
    setStaticOptionsBranches(false)
    setQueryBranches('')
    setBranches([])
    if (query && owner) {
      isLoading = true
      axios
        .get(
          `https://git.door43.org/api/v1/repos/search?q=${query}&owner=${owner}&limit=1000`
        )
        .then((res) => {
          setOrgRepos(res.data.data)

          setStaticOptions(true)
        })
        .catch((error) => console.log(error))
        .finally((isLoading = false))
    }
  }
  console.log(branches)
  const handleSearchBranches = () => {
    console.log(query)
    if (selectedRepo) {
      isLoading = true
      axios
        .get(`https://git.door43.org/api/v1/repos/${owner}/${query}/branches`)
        .then((res) => {
          // console.log(res.data)
          setBranches(res.data)

          setStaticOptionsBranches(true)
        })
        .catch((error) => console.log(error))
        .finally((isLoading = false))
    }
  }
  const filteredRepo = useMemo(
    () =>
      !orgRepos
        ? []
        : query === ''
        ? orgRepos?.map((el) => el.name)
        : orgRepos
            ?.map((el) => el.name)
            .filter((repo) => {
              return repo.toLowerCase().includes(query.toLowerCase())
            }),
    [orgRepos, query]
  )
  const filteredBranches = useMemo(
    () =>
      !branches
        ? []
        : queryBranches === ''
        ? branches?.map((el) => el.name)
        : branches
            ?.map((el) => el.name)
            .filter((repo) => {
              return repo.toLowerCase().includes(queryBranches.toLowerCase())
            }),
    [branches, queryBranches]
  )
  const urlCommit = useMemo(
    () => branches.find((branch) => branch.name === selectedBranch),
    [branches, selectedBranch]
  )
  console.log(urlCommit)
  console.log(branches, selectedBranch)
  console.log(selectedBranch, queryBranches)
  return (
    <div className="card flex flex-col gap-4 py-7">
      <div className="flex gap-2 self-end">
        <div>{t('Handle')}</div>
        <Switch
          checked={isHandleAddingLink}
          onChange={() => {
            setIsHandleAddingLink((prev) => !prev)
          }}
          className={`relative inline-flex h-6 w-11 items-center bg-cyan-600 rounded-full`}
        >
          <span
            className={`${
              !isHandleAddingLink ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
        <div>{t('SearchLink')}</div>
      </div>

      {isHandleAddingLink ? (
        <div>
          <div>{t('TranslationLink')}</div>
          <div className="flex justify-between gap-4 w-full">
            <input
              className="p-2 w-full rounded-lg bg-white text-slate-900 border border-blue-200
placeholder-blue-200 focus:border-slate-900 focus:outline-none "
              value={translationLink?.url || ''}
              onChange={(e) =>
                setTranslationLink((prev) => ({ ...prev, url: e.target.value }))
              }
            />
            {book?.checks && (
              <Reader
                className="w-6 min-w-[1.5rem] cursor-pointer"
                onClick={() =>
                  push({
                    pathname: `/projects/${project?.code}/books/read`,
                    query: {
                      bookid: book.code,
                    },
                    shallow: true,
                  })
                }
              />
            )}
          </div>
          <div>{t('LevelChecks')}</div>
          <div className="flex justify-between items-center">
            <div className="flex gap-5">
              {[...Array(3).keys()]
                .map((i) => i + 1)
                .map((el) => (
                  <div className="flex gap-2" key={el}>
                    <input
                      id={el}
                      type="checkbox"
                      className="w-6 h-6 accent-cyan-600"
                      checked={translationLink?.level === el || false}
                      onChange={() =>
                        setTranslationLink((prev) => ({ ...prev, level: el }))
                      }
                    />
                    <label htmlFor={el}>{el}</label>
                  </div>
                ))}
            </div>
            <button className="btn-primary" onClick={handleSaveLink}>
              {t('Save')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <span className="w-1/4">Owner</span>{' '}
            <input className={classInput} onChange={(e) => setOwner(e.target.value)} />
          </div>
          <div className="flex gap-4">
            <span className="w-1/4">Repos</span>

            <Combobox
              value={query}
              onChange={setQuery}
              // disabled={!orgRepos?.length}
            >
              <div className="w-full relative">
                <Combobox.Input
                  onChange={(event) => {
                    setStaticOptions(false)
                    setQuery(event.target.value)
                  }}
                  className={`${classInput} `}
                  onBlur={() => setStaticOptions(false)}
                />
                <Spinner
                  className={` animate-spin my-0 mx-auto h-5 w-5 -mt-8 text-cyan-600 ${
                    isLoading ? 'block' : 'hidden'
                  }`}
                />
                {filteredRepo.length > 0 && (
                  <Combobox.Options
                    static={staticOptions}
                    className={`absolute w-full bg-white rounded-b-lg overflow-y-scroll max-h-[40vh] ${classInput} z-10`}
                  >
                    {filteredRepo?.map((repo) => (
                      <Combobox.Option
                        key={repo}
                        value={repo}
                        onClick={(e) => {
                          setStaticOptions(false)
                          setSelectedRepo(query)
                        }}
                      >
                        {repo}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                )}
              </div>
            </Combobox>

            {
              <button className="btn-primary" onClick={handleSearch}>
                {t('Search')}
              </button>
            }
          </div>
          <div className="flex gap-4">
            <span className="w-1/4">Branches</span>{' '}
            <Combobox
              value={queryBranches}
              onChange={setQueryBranches}
              // disabled={!orgRepos?.length}
            >
              <div className="w-full relative">
                <Combobox.Input
                  onChange={(event) => {
                    setStaticOptionsBranches(false)
                    setQueryBranches(event.target.value)
                  }}
                  className={`${classInput} `}
                  onBlur={() => setStaticOptionsBranches(false)}
                />
                <Spinner
                  className={` animate-spin my-0 mx-auto h-5 w-5 -mt-8 text-cyan-600 ${
                    isLoading ? 'block' : 'hidden'
                  }`}
                />
                {filteredBranches.length > 0 && (
                  <Combobox.Options
                    static={staticOptionsBranches}
                    className={`absolute w-full bg-white rounded-b-lg overflow-y-scroll max-h-[40vh] ${classInput}`}
                  >
                    {filteredBranches?.map((branch) => (
                      <Combobox.Option
                        key={branch}
                        value={branch}
                        onClick={(e) => {
                          setStaticOptionsBranches(false)
                          setSelectedBranch(query)
                        }}
                      >
                        {branch}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                )}
              </div>
            </Combobox>
            <button className="btn-primary" onClick={handleSearchBranches}>
              {t('Search')}
            </button>
          </div>
          <div className="flex gap-4">
            <span className="w-1/4">URl of commits</span>
            <input className={classInput} value={urlCommit?.commit?.url} />
            <button className="btn-primary">{t('Save')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
