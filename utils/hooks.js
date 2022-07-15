import useSWR from 'swr'

const fetcher = (url, token) =>
  fetch(url, {
    method: 'GET',
    headers: new Headers({ 'Content-Type': 'application/json', token }),
    credentials: 'same-origin',
  }).then((res) => res.json())

export function useLanguages(token) {
  const { data, mutate, error } = useSWR(
    token ? ['/api/languages', token] : null,
    fetcher
  )
  const loading = !data && !error
  const languages = data?.languages
  return [languages, { mutate, loading, error }]
}
export function useUsers(token) {
  const {
    data: users,
    mutate,
    error,
  } = useSWR(token ? ['/api/users', token] : null, fetcher)
  const loading = !users && !error
  return [users, { mutate, loading, error }]
}

export function useUser(token, login) {
  const {
    data: user,
    mutate,
    error,
  } = useSWR(token && login ? ['/api/users/' + login, token] : null, fetcher)
  const loading = !user && !error
  return [user, { mutate, loading, error }]
}
export function useProjects(token) {
  const { data, mutate, error } = useSWR(token ? ['/api/projects', token] : null, fetcher)
  const loading = !data && !error
  const projects = data
  return [projects, { mutate, loading, error }]
}
export function useMethod(token) {
  const { data, mutate, error } = useSWR(token ? ['/api/methods', token] : null, fetcher)
  const loading = !data && !error
  const methods = data
  return [methods, { mutate, loading, error }]
}
export function useProject({ token, code }) {
  const {
    data: project,
    mutate,
    error,
  } = useSWR(token && code ? [`/api/projects/${code}`, token] : null, fetcher)
  const loading = !project && !error
  return [project, { mutate, loading, error }]
}
export function useCoordinator({ token, id }) {
  const {
    data: coordinator,
    mutate,
    error,
  } = useSWR(token ? [`/api/coordinators/${id}`, token] : null, fetcher)
  const loading = !coordinator && !error
  return [coordinator, { mutate, loading, error }]
}
