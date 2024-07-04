import { useEffect, useMemo, useState } from 'react'

import axios from 'axios'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { checkLSVal } from './helper'
import { useRecoilState } from 'recoil'

import { currentVerse } from '../components/state/atoms'

const SCROLL_TOP_OFFSET = 20

const fetcher = async (url) => {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      credentials: 'same-origin',
    })
    const data = await res.json()

    if (!res.ok) {
      throw { status: res.status, ...data }
    }

    return data
  } catch (error) {
    console.error('Fetch Error:', error)
    throw error
  }
}
/**
 *hook returns information about all languages from table ''
 * @returns {array}
 */
export function useLanguages() {
  const {
    data: languages,
    mutate,
    error,
    isLoading,
  } = useSWR(['/api/languages'], fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  return [languages, { mutate, isLoading, error }]
}

/**
 *hook returns all personal notes
 * @returns {array}
 */
export function useAllPersonalNotes() {
  const {
    data: allNotes,
    mutate,
    error,
    isLoading,
  } = useSWR(['/api/personal_notes/all_notes'], fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })
  return [allNotes, { mutate, isLoading, error }]
}

/**
 *hook returns all team notes
 * @returns {array}
 */
export function useAllTeamlNotes() {
  const {
    data: allNotes,
    mutate,
    error,
    isLoading,
  } = useSWR(['/api/team_notes/all_notes'], fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })
  return [allNotes, { mutate, isLoading, error }]
}

/**
 *hook returns words from dictionarie
 * @returns {array}
 */
// hooks/useAllWords.js
export function useAllWords(queryWords) {
  const { searchQuery, wordsPerPage, pageNumber, project_id_param } = queryWords

  const apiUrl = project_id_param
    ? `/api/dictionaries/getWords?searchQuery=${searchQuery}&wordsPerPage=${wordsPerPage}&pageNumber=${pageNumber}&project_id_param=${project_id_param}`
    : null

  const {
    data: allWords,
    mutate,
    error,
    isLoading,
  } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  if (!project_id_param) {
    return [null, { mutate, isLoading, error }]
  }

  if (error) {
    console.error('API Error Details:', error)
  }

  return [allWords, { mutate, isLoading, error }]
}

/**
 *hook returns information about all users
 * @returns {array}
 */
export function useUsers() {
  const {
    data: users,
    mutate,
    error,
    isLoading,
  } = useSWR(['/api/users'], fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  return [users, { mutate, isLoading, error }]
}

export function useUser(id) {
  const {
    data: user,
    mutate,
    error,
    isLoading,
  } = useSWR(id ? ['/api/users/' + id] : null, fetcher)
  return [user, { mutate, isLoading, error }]
}
/**
 *hook returns information about projects
 * @returns {array}
 */
export function useProjects() {
  const { data, mutate, error, isLoading } = useSWR([`/api/projects`], fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })
  // TODO форматировать data, нужно пройтись по всем проектам и раскидать, чтобы каждый проект лежал внутри языка
  return [data, { mutate, error, isLoading }]
}

/**
 *hook returns all methods from table 'methods'
 * @param {string} code code of project
 * @returns {array}
 */
export function useMethod() {
  const {
    data: methods,
    mutate,
    error,
    isLoading,
  } = useSWR(['/api/methods'], fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  return [methods, { mutate, error, isLoading }]
}
/**
 *hook returns information about specific project from table 'projects'
 * @param {string} code code of project
 * @returns {object}
 */
export function useProject({ code }) {
  const {
    data: project,
    mutate,
    error,
    isLoading,
  } = useSWR(code ? [`/api/projects/${code}`] : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })
  return [project, { mutate, error, isLoading }]
}
/**
 *hook returns all users on specific project with role 'coordinator'
 * @param {string} code code of project
 * @returns {array}
 */
export function useCoordinators({ code }) {
  const {
    data: coordinators,
    mutate,
    error,
    isLoading,
  } = useSWR(code ? [`/api/projects/${code}/coordinators`] : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })
  return [coordinators, { mutate, error, isLoading }]
}
/**
 *hook returns all users on specific project with role 'translator'
 * @param {string} code code of project
 * @returns {array}
 */
export function useTranslators({ code, revalidateIfStale, revalidateOnFocus }) {
  const {
    data: translators,
    mutate,
    error,
    isLoading,
  } = useSWR(code ? [`/api/projects/${code}/translators`] : null, fetcher, {
    revalidateOnFocus,
    revalidateIfStale,
  })

  return [translators, { mutate, error, isLoading }]
}

/**
 *hook receives information from git.door43
 * @param {object} config 2 keys object: {resource:{owner, repo, commit},reference: { book, chapter, step, verses }}
 * @param {string} url url of api, for example: '/api/git/bible'
 * @returns {object} { data, mutate, error, isLoading }
 */
export function useGetResource({ config, url }) {
  const {
    verses,
    reference: { book, chapter },
    resource: { owner, repo, commit, bookPath },
  } = config
  const params = { owner, repo, commit, bookPath, book, chapter, verses }
  const fetcher = ([url, params]) => axios.get(url, { params }).then((res) => res.data)
  const { isLoading, data, error } = useSWR(
    url && owner && repo && commit && bookPath ? [url, params] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  )
  return { isLoading, data, error }
}

export function usePersonalNotes() {
  const {
    data: notes,
    mutate,
    error,
    isLoading,
  } = useSWR([`/api/personal_notes`], fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  return [notes, { mutate, error, isLoading }]
}

export function useTeamNotes({ project_id }) {
  const {
    data: notes,
    mutate,
    error,
    isLoading,
  } = useSWR(project_id ? [`/api/team_notes/${project_id}`] : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  return [notes, { mutate, error, isLoading }]
}

export function useGetBrief({ project_id }) {
  const {
    data: brief,
    mutate,
    error,
    isLoading,
  } = useSWR(project_id ? [`/api/briefs/${project_id}`] : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })
  return [brief, { mutate, error, isLoading }]
}

export function useScroll({ toolName, isLoading, idPrefix }) {
  const [currentScrollVerse, setCurrentScrollVerse] = useRecoilState(currentVerse)
  const [highlightIds, setHighlightIds] = useState(() => {
    return checkLSVal('highlightIds', {}, 'object')
  })

  useEffect(() => {
    setTimeout(() => {
      const element = document.getElementById(idPrefix + currentScrollVerse)
      const container = document.getElementById('container_' + toolName)
      if (element && container) {
        container.scrollBy({
          top:
            element.getBoundingClientRect().top -
            container.getBoundingClientRect().top -
            SCROLL_TOP_OFFSET,
        })
      }
    }, 100)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScrollVerse, isLoading])

  const handleSaveScroll = (verse, id) => {
    if (id) {
      localStorage.setItem(
        'highlightIds',
        JSON.stringify({ ...highlightIds, [toolName]: 'id' + id })
      )
      setHighlightIds((prev) => ({ ...prev, [toolName]: 'id' + id }))
    }
    localStorage.setItem('currentScrollVerse', verse)
    setCurrentScrollVerse(verse)
  }
  return { highlightId: highlightIds[toolName], currentScrollVerse, handleSaveScroll }
}

export function useBriefState({ project_id }) {
  const [briefResume, setBriefResume] = useState()
  const [brief, { isLoading }] = useGetBrief({
    project_id,
  })

  const dataCollection = useMemo(() => {
    return brief?.is_enable ? brief?.data_collection : []
  }, [brief?.data_collection, brief?.is_enable])

  useEffect(() => {
    setBriefResume(dataCollection.reduce((final, el) => final + el.resume, ''))
  }, [dataCollection])

  return { briefResume, isBrief: brief?.is_enable, isLoading, briefName: brief?.name }
}

/**
 *hook returns information about resources of specific project from table 'projects'
 * @param {string} code code of project
 * @returns {array}
 */
export function useGetProjectResources({ code }) {
  const {
    data: resources,
    mutate,
    error,
    isLoading,
  } = useSWR(code ? [`/api/projects/${code}/resources`] : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })
  return [resources, { mutate, error, isLoading }]
}

/**
 *hook returns information about books of specific project from table 'books'
 * @param {string} code code of project
 * @returns {array}
 */
export function useGetBooks({ code }) {
  const {
    data: books,
    mutate,
    error,
    isLoading,
  } = useSWR(code ? [`/api/projects/${code}/books`] : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })
  return [books, { mutate, error, isLoading }]
}

/**
 *hook returns information about books with validation levels and verse with draft versions
 * @param {string} code code of project
 * @returns {array}
 */
export function useGetChaptersTranslate({ code }) {
  const {
    data: books,
    mutate,
    error,
    isLoading,
  } = useSWR(code ? [`/api/projects/${code}/books/chapters_translate`] : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })
  return [books, { mutate, error, isLoading }]
}

/**
 *hook returns information about specific book of specific project from table 'books'
 * @param {string} code code of project
 * @param {string} book_code code of book
 * @returns {object}
 */
export function useGetBook({ code, book_code }) {
  const {
    data: book,
    mutate,
    error,
    isLoading,
  } = useSWR(
    code && book_code ? [`/api/projects/${code}/books/${book_code}`] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  )
  return [book, { mutate, error, isLoading }]
}

/**
 *hook returns information about chapters of specific project from table 'chapters'
 * @param {string} code code of project
 * @param {string} book_code code of book
 * @returns {array}
 */
export function useGetChapters({
  code,
  book_code,
  revalidateIfStale = false,
  revalidateOnFocus = false,
}) {
  const {
    data: chapters,
    mutate,
    error,
    isLoading,
  } = useSWR(
    code && book_code ? [`/api/projects/${code}/books/${book_code}/chapters`] : null,
    fetcher,
    {
      revalidateOnFocus,
      revalidateIfStale,
    }
  )
  return [chapters, { mutate, error, isLoading }]
}

/**
 *hook returns information about specific chapter from table 'chapters'
 * @param {string} code code of project
 * @param {string} book_code code of book
 * @param {string} chapter_id num of chapter

 * @returns {object}
 */
export function useGetChapter({ code, book_code, chapter_id }) {
  const {
    data: chapter,
    mutate,
    error,
    isLoading,
    isValidating,
  } = useSWR(
    code && book_code && chapter_id
      ? [`/api/projects/${code}/books/${book_code}/chapters/${chapter_id}`]
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  )
  return [chapter, { mutate, error, isLoading, isValidating }]
}

/**
 *hook returns information about created chapters from table 'chapters'
 * @param {string} code code of project
 * @param {array} chapters
 *
 * @returns {array}
 */
export function useGetCreatedChapters({ code, chapters }) {
  const {
    data: createdChapters,
    mutate,
    error,
    isLoading,
  } = useSWR(
    code && chapters
      ? [`/api/projects/${code}/created_chapters?chapters=${chapters}`]
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  )
  return [createdChapters, { mutate, error, isLoading }]
}

/**
 *hook returns information about verses of specific chapter from table 'verses'
 * @param {string} code code of project
 * @param {string} book_code code of book
 * @param {string} chapter_id id of chapter
 * @returns {array}
 */
export function useGetVerses({ code, book_code, chapter_id }) {
  const {
    data: verses,
    mutate,
    error,
    isLoading,
  } = useSWR(
    code && book_code && chapter_id
      ? [`/api/projects/${code}/books/${book_code}/chapters/${chapter_id}/verses`]
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  )
  return [verses, { mutate, error, isLoading }]
}
//TODO сделать описание
export function useGetInfo({ config, url }) {
  const {
    reference: { chapter },
    tnLink: _url,
  } = config

  const params = { url: _url, chapter }

  const fetcher = ([url, params]) => axios.get(url, { params }).then((res) => res.data)
  const { isLoading, data, error } = useSWR(
    url && _url && chapter ? [url, params] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  )

  return { isLoading, data, error }
}

/**
 *hook returns information about access
 * @param {string} code code of project
 * @param {string} user_id id of user
 * @returns {object}
 */
export function useAccess({ user_id, code }) {
  const {
    data: level,
    mutate,
    error,
    isLoading,
  } = useSWR(code && user_id ? [`/api/projects/${code}/${user_id}`] : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })
  const isTranslatorAccess = useMemo(
    () => ['admin', 'coordinator', 'moderator', 'translator'].includes(level),
    [level]
  )

  const isModeratorAccess = useMemo(
    () => ['admin', 'coordinator', 'moderator'].includes(level),
    [level]
  )
  const isCoordinatorAccess = useMemo(
    () => ['admin', 'coordinator'].includes(level),
    [level]
  )
  const isAdminAccess = useMemo(() => 'admin' === level, [level])

  return [
    { isModeratorAccess, isCoordinatorAccess, isAdminAccess, isTranslatorAccess },
    { mutate, error, isLoading },
  ]
}

/**
 *hook returns information about steps of current project
 * @param {string} code code of project
 *
 * @returns {array}
 */
export function useGetSteps({ code }) {
  const {
    data: steps,
    mutate,
    error,
    isLoading,
  } = useSWR(code ? [`/api/projects/${code}/steps`] : null, fetcher, {
    revalidateOnFocus: true,
    revalidateIfStale: true,
  })
  return [steps, { mutate, error, isLoading }]
}

export function useGetTheme() {
  const [theme, setTheme] = useState(() => {
    return checkLSVal('theme', 'default', 'string')
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'default'
      setTheme(savedTheme)
      document.documentElement.className = savedTheme
    }
  }, [])
  return theme
}
export function useGetWholeBook({ config, url }) {
  const {
    book,
    bookPath,
    resource: { owner, repo, commit },
  } = config
  const params = { owner, repo, commit, bookPath, book }
  const fetcher = ([url, params]) => axios.get(url, { params }).then((res) => res.data)
  const { isLoading, data, error } = useSWR(
    url && owner && repo && commit && bookPath ? [url, params] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  )
  return { isLoading, data, error }
}

export function useGetAquiferResources({
  book_code,
  chapter_num,
  verse_num,
  query,
  language_code,
  resource_type,
}) {
  const limit = 10
  const getKey = (index) => {
    const offset = index * limit
    return book_code && language_code
      ? `/api/aquifer/${book_code}/${chapter_num}/${verse_num}/${
          resource_type === 'images' ? 'images' : 'notes'
        }?query=${query}&limit=${limit}&offset=${offset}&language_code=${language_code}&resource_type=${resource_type}`
      : null
  }

  const { data, error, isLoading, isValidating, mutate, size, setSize } = useSWRInfinite(
    getKey,
    fetcher,
    { revalidateOnFocus: false, revalidateIfStale: false }
  )
  const loadMore = () => {
    setSize(size + 1)
  }

  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')

  let resources = []
  let isShowLoadMoreButton = false
  if (data) {
    resources = data.reduce((acc, curr) => [...acc, ...curr.items], [])
    if (data[0].totalItemCount > resources.length && limit < data[0].totalItemCount) {
      isShowLoadMoreButton = true
    } else {
      isShowLoadMoreButton = false
    }
  }

  return {
    resources,
    loadMore,
    error,
    isLoading,
    isValidating,
    mutate,
    size,
    setSize,
    isShowLoadMoreButton,
    isLoadingMore,
  }
}
