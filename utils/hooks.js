import { useEffect, useMemo, useState } from 'react'

import axios from 'axios'
import useSWR from 'swr'
import { checkLSVal } from './helper'
import { useRecoilState } from 'recoil'

import { currentVerse } from '../components/Panel/state/atoms'

const fetcher = async ([url, token]) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: new Headers({ 'Content-Type': 'application/json', token }),
    credentials: 'same-origin',
  })
  if (!res.ok) {
    const error = await res.json()
    error.status = res.status
    throw error
  }
  return res.json()
}
/**
 *hook returns information about all languages from table ''
 * @param {string} token token of current session of authenticated user
 * @returns {array}
 */
export function useLanguages(token) {
  const {
    data: languages,
    mutate,
    error,
    isLoading,
  } = useSWR(token ? ['/api/languages', token] : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  return [languages, { mutate, isLoading, error }]
}
/**
 *hook returns information about all users
 * @param {string} token token of current session of authenticated user
 * @returns {array}
 */
export function useUsers(token) {
  const {
    data: users,
    mutate,
    error,
    isLoading,
  } = useSWR(token ? ['/api/users', token] : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  return [users, { mutate, isLoading, error }]
}

export function useUser(token, id) {
  const {
    data: user,
    mutate,
    error,
    isLoading,
  } = useSWR(token && id ? ['/api/users/' + id, token] : null, fetcher)
  return [user, { mutate, isLoading, error }]
}
/**
 *hook returns information about projects
 * @param {string} token token of current session of authenticated user
 * @returns {array}
 */
export function useProjects({ token }) {
  const { data, mutate, error, isLoading } = useSWR(
    token ? [`/api/projects`, token] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  )
  // TODO форматировать data, нужно пройтись по всем проектам и раскидать, чтобы каждый проект лежал внутри языка
  return [data, { mutate, error, isLoading }]
}

/**
 *hook returns all methods from table 'methods'
 * @param {string} code code of project
 * @param {string} token token of current session of authenticated user
 * @returns {array}
 */
export function useMethod(token) {
  const {
    data: methods,
    mutate,
    error,
    isLoading,
  } = useSWR(token ? ['/api/methods', token] : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  return [methods, { mutate, error, isLoading }]
}
/**
 *hook returns information about specific project from table 'projects'
 * @param {string} code code of project
 * @param {string} token token of current session of authenticated user
 * @returns {object}
 */
export function useProject({ token, code }) {
  const {
    data: project,
    mutate,
    error,
    isLoading,
  } = useSWR(token && code ? [`/api/projects/${code}`, token] : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })
  return [project, { mutate, error, isLoading }]
}
/**
 *hook returns all users on specific project with role 'coordinator'
 * @param {string} code code of project
 * @param {string} token token of current session of authenticated user
 * @returns {array}
 */
export function useCoordinators({ token, code }) {
  const {
    data: coordinators,
    mutate,
    error,
    isLoading,
  } = useSWR(
    token && code ? [`/api/projects/${code}/coordinators`, token] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  )
  return [coordinators, { mutate, error, isLoading }]
}
/**
 *hook returns all users on specific project with role 'translator'
 * @param {string} code code of project
 * @param {string} token token of current session of authenticated user
 * @returns {array}
 */
export function useTranslators({ token, code }) {
  const {
    data: translators,
    mutate,
    error,
    isLoading,
  } = useSWR(
    token && code ? [`/api/projects/${code}/translators`, token] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  )

  return [translators, { mutate, error, isLoading }]
}

/**
 *hook receives information from the database - whether the user has confirmed agreements and returns a link for a redirect
 * @param {string} userId id of authenticated user
 * @param {string} token token of current session of authenticated user
 * @param {string} startLink the default link that the application needs to follow if the user has not passed the agreement
 * @returns {string}
 */
export function useRedirect({ user, startLink }) {
  const [href, setHref] = useState(startLink)

  useEffect(() => {
    if (!user?.id) {
      return
    }
    const { agreement, confession } = user
    if (!agreement) {
      setHref('/agreements')
      return
    }
    if (!confession) {
      setHref('/confession')
      return
    }

    setHref(`/account`)
  }, [user])

  return { href }
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

export function usePersonalNotes({ token }) {
  const {
    data: notes,
    mutate,
    error,
    isLoading,
  } = useSWR(token ? [`/api/personal_notes`, token] : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  return [notes, { mutate, error, isLoading }]
}

export function useTeamNotes({ token, project_id }) {
  const {
    data: notes,
    mutate,
    error,
    isLoading,
  } = useSWR(
    token && project_id ? [`/api/team_notes/${project_id}`, token] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  )

  return [notes, { mutate, error, isLoading }]
}

export function useGetBrief({ token, project_id }) {
  const {
    data: brief,
    mutate,
    error,
    isLoading,
  } = useSWR(token && project_id ? [`/api/briefs/${project_id}`, token] : null, fetcher, {
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
      document?.getElementById(idPrefix + currentScrollVerse)?.scrollIntoView()
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

export function useBriefState({ token, project_id }) {
  const [briefResume, setBriefResume] = useState()
  const [brief, { isLoading }] = useGetBrief({
    token,
    project_id,
  })
  useEffect(() => {
    if (brief?.is_enable) {
      setBriefResume(brief.data_collection?.reduce((final, el) => final + el.resume, ''))
    }
  }, [brief])
  return { briefResume, isBrief: brief?.is_enable, isLoading }
}

/**
 *hook returns information about resources of specific project from table 'projects'
 * @param {string} code code of project
 * @param {string} token token of current session of authenticated user
 * @returns {array}
 */
export function useGetProjectResources({ token, code }) {
  const {
    data: resources,
    mutate,
    error,
    isLoading,
  } = useSWR(token && code ? [`/api/projects/${code}/resources`, token] : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })
  return [resources, { mutate, error, isLoading }]
}

/**
 *hook returns information about books of specific project from table 'books'
 * @param {string} code code of project
 * @param {string} token token of current session of authenticated user
 * @returns {array}
 */
export function useGetBooks({ token, code }) {
  const {
    data: books,
    mutate,
    error,
    isLoading,
  } = useSWR(token && code ? [`/api/projects/${code}/books`, token] : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })
  return [books, { mutate, error, isLoading }]
}

/**
 *hook returns information about specific book of specific project from table 'books'
 * @param {string} code code of project
 * @param {string} token token of current session of authenticated user
 * @param {string} book_code code of book
 * @returns {object}
 */
export function useGetBook({ token, code, book_code }) {
  const {
    data: book,
    mutate,
    error,
    isLoading,
  } = useSWR(
    token && code && book_code
      ? [`/api/projects/${code}/books/${book_code}`, token]
      : null,
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
 * @param {string} token token of current session of authenticated user
 * @param {string} book_code code of book
 * @returns {array}
 */
export function useGetChapters({ token, code, book_code }) {
  const {
    data: chapters,
    mutate,
    error,
    isLoading,
  } = useSWR(
    token && code && book_code
      ? [`/api/projects/${code}/books/${book_code}/chapters`, token]
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  )
  return [chapters, { mutate, error, isLoading }]
}

/**
 *hook returns information about specific chapter from table 'chapters'
 * @param {string} code code of project
 * @param {string} token token of current session of authenticated user
 * @param {string} book_code code of book
 * @param {string} chapter_id num of chapter

 * @returns {object}
 */
export function useGetChapter({ token, code, book_code, chapter_id }) {
  const {
    data: chapter,
    mutate,
    error,
    isLoading,
    isValidating,
  } = useSWR(
    token && code && book_code && chapter_id
      ? [`/api/projects/${code}/books/${book_code}/chapters/${chapter_id}`, token]
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
 * @param {string} token token of current session of authenticated user
 * @param {array} chapters
 *
 * @returns {array}
 */
export function useGetCreatedChapters({ token, code, chapters }) {
  const {
    data: createdChapters,
    mutate,
    error,
    isLoading,
  } = useSWR(
    token && code && chapters
      ? [`/api/projects/${code}/created_chapters?chapters=${chapters}`, token]
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
 * @param {string} token token of current session of authenticated user
 * @param {string} book_code code of book
 * @param {string} chapter_id id of chapter
 * @returns {array}
 */
export function useGetVerses({ token, code, book_code, chapter_id }) {
  const {
    data: verses,
    mutate,
    error,
    isLoading,
  } = useSWR(
    token && code && book_code && chapter_id
      ? [`/api/projects/${code}/books/${book_code}/chapters/${chapter_id}/verses`, token]
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
 * @param {string} token token of current session of authenticated user
 * @param {string} user_id id of user
 * @returns {object}
 */
export function useAccess({ token, user_id, code }) {
  const {
    data: level,
    mutate,
    error,
    isLoading,
  } = useSWR(
    token && code && user_id ? [`/api/projects/${code}/${user_id}`, token] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
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
    { isModeratorAccess, isCoordinatorAccess, isAdminAccess },
    { mutate, error, isLoading },
  ]
}
