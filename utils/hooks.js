import { useEffect, useState } from 'react'
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
 *hook returns information about projects in a specific language
 * @param {string} language_code code of language
 * @param {string} token token of current session of authenticated user
 * @returns {array}
 */
export function useProjects({ token, language_code }) {
  const { data, mutate, error } = useSWR(
    token ? [`/api/${language_code}/projects`, token] : null,
    fetcher
  )

  const loading = !data && !error
  const projects = data
  return [projects, { mutate, loading, error }]
}
/**
 *hook returns information about projects in which a specific user is involved
 * @param {string} id id of user
 * @param {string} token token of current session of authenticated user
 * @returns {array}
 */
export function useUserProjects({ token, id }) {
  const { data, mutate, error } = useSWR(
    token ? [`/api/users/${id}/projects`, token] : null,
    fetcher
  )

  const loading = !data && !error
  const projects = data
  return [projects, { mutate, loading, error }]
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
  } = useSWR(token && code ? [`/api/[lang]/projects/${code}`, token] : null, fetcher)
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
  } = useSWR(token ? [`/api/[id]/projects/${code}/coordinators`, token] : null, fetcher)
  const loading = !coordinators && !error
  return [coordinators, { mutate, loading, error }]
}
/**
 *hook returns first user on specific project with role 'moderator'
 * @param {string} code code of project
 * @param {string} token token of current session of authenticated user
 * @returns {object}
 */
export function useModerators({ token, code }) {
  const {
    data: moderators,
    mutate,
    error,
  } = useSWR(token ? [`/api/[id]/projects/${code}/moderators`, token] : null, fetcher)
  const loading = !moderators && !error
  return [moderators, { mutate, loading, error }]
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
  } = useSWR(token ? [`/api/[id]/projects/${code}/translators`, token] : null, fetcher)
  const loading = !translators && !error
  return [translators, { mutate, loading, error }]
}

/**
 *hook returns all roles  of current project with information about users
 * @param {string} code code of project
 * @param {string} token token of current session of authenticated user
 * @returns {array}
 */
export function useRoles({ token, code }) {
  const {
    data: roles,
    mutate,
    error,
  } = useSWR(token ? [`/api/[id]/projects/${code}/roles`, token] : null, fetcher)
  const loading = !roles && !error
  return [roles, { mutate, loading, error }]
}
/**
 *hook returns all permissions of current role
 * @param {string} role role
 * @param {string} token token of current session of authenticated user
 * @returns {array}
 */
export function usePermissions({ role, token }) {
  const {
    data: permissions,
    mutate,
    error,
  } = useSWR(token && role ? [`/api/permissions/${role}`, token] : null, fetcher)
  const loading = !permissions && !error
  return [permissions, { mutate, loading, error }]
}
/**
 *hook returns all roles of current user in specific project
 * @param {string} id id of authenticated user
 * @param {string} token token of current session of authenticated user
 * @param {string} code code of project
 * @returns {array} array

 */
export function useUserProjectRole({ token, id, code }) {
  const { data, mutate, error } = useSWR(
    token && id && code ? [`/api/users/${id}/projects/${code}`, token] : null,
    fetcher
  )

  const loading = !data && !error
  const userProjectRoles = data
  return [userProjectRoles, { mutate, loading, error }]
}
/**
 *hook returns from all user roles the one that is the highest in the hierarchy
 * @param {string} userId id of authenticated user
 * @param {string} token token of current session of authenticated user
 * @param {string} code code of project
 * @param {boolean} isAdmin is user 'admin'
 * @returns {string}
 */
export function useProjectRole({ userId, token, code, isAdmin }) {
  const [userProjectRoles] = useUserProjectRole({
    token,
    code,
    id: userId,
  })
  const rolesAuthenticated = userProjectRoles && userProjectRoles.map((el) => el.role)
  const [projectRole, setProjectRole] = useState(null)

  useEffect(() => {
    if (isAdmin) {
      setProjectRole('admin')
      return
    }
    if (!rolesAuthenticated) {
      return
    }

    if (rolesAuthenticated.length === 0) {
      return
    }

    const arr = ['coordinator', 'moderator', 'translator']
    for (let i = 0; i < arr.length; ++i) {
      if (rolesAuthenticated.includes(arr[i])) {
        setProjectRole(arr[i])
        break
      }
    }
  }, [isAdmin, projectRole, rolesAuthenticated])

  return projectRole
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
