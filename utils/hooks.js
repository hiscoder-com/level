import { useEffect, useState } from 'react'

import axios from 'axios'
import useSWR from 'swr'

const fetcher = async (url, token) => {
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
  const { data, mutate, error } = useSWR(
    token ? ['/api/languages', token] : null,
    fetcher
  )
  const loading = !data && !error
  const languages = data
  return [languages, { mutate, loading, error }]
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
  } = useSWR(token ? ['/api/users', token] : null, fetcher)
  const loading = !users && !error
  return [users, { mutate, loading, error }]
}

export function useUser(token, id) {
  const {
    data: user,
    mutate,
    error,
  } = useSWR(token && id ? ['/api/users/' + id, token] : null, fetcher)
  const loading = !user && !error
  return [user, { mutate, loading, error }]
}
/**
 *hook returns information about projects
 * @param {string} token token of current session of authenticated user
 * @returns {array}
 */
export function useProjects({ token }) {
  const { data, mutate, error } = useSWR(token ? [`/api/projects`, token] : null, fetcher)
  const loading = !data && !error
  // форматировать data, нужно пройтись по всем проектам и раскидать, чтобы каждый проект лежал внутри языка
  return [data, { mutate, loading, error }]
}

/**
 *hook returns all methods from table 'methods'
 * @param {string} code code of project
 * @param {string} token token of current session of authenticated user
 * @returns {array}
 */
export function useMethod(token) {
  const { data, mutate, error } = useSWR(token ? ['/api/methods', token] : null, fetcher)
  const loading = !data && !error
  const methods = data
  return [methods, { mutate, loading, error }]
}
/**
 *hook returns information about specific project from table 'projects'
 * @param {string} code code of project
 * @param {string} token token of current session of authenticated user
 * @returns {array}
 */
export function useProject({ token, code }) {
  const {
    data: project,
    mutate,
    error,
  } = useSWR(token && code ? [`/api/projects/${code}`, token] : null, fetcher)
  const loading = !project && !error
  return [project, { mutate, loading, error }]
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
  } = useSWR(
    token && code ? [`/api/projects/${code}/coordinators`, token] : null,
    fetcher
  )
  const loading = !coordinators && !error
  return [coordinators, { mutate, loading, error }]
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
  } = useSWR(token && code ? [`/api/projects/${code}/translators`, token] : null, fetcher)
  const loading = !translators && !error
  return [translators, { mutate, loading, error }]
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
 * @returns {object} {loading, data, error}
 */
export function useGetResource({ config, url }) {
  const {
    verses,
    reference: { book, chapter, step },
    resource: { owner, repo, commit, bookPath },
  } = config
  const params = { owner, repo, commit, bookPath, book, chapter, step, verses }

  const fetcher = (url, params) => axios.get(url, { params }).then((res) => res.data)
  const { data, error } = useSWR([url, params], fetcher)
  const loading = !data && !error

  return { loading, data, error }
}

export function usePersonalNotes({ token }) {
  const {
    data: notes,
    mutate,
    error,
  } = useSWR(token ? [`/api/personal_notes`, token] : null, fetcher)
  const loading = !notes && !error
  return [notes, { mutate, loading, error }]
}

export function useTeamNotes({ token, project_id }) {
  const {
    data: notes,
    mutate,
    error,
  } = useSWR(token ? [`/api/team_notes/${project_id}`, token] : null, fetcher)
  const loading = !notes && !error
  return [notes, { mutate, loading, error }]
}
