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
export function useAllUsers(token) {
  const { data, mutate, error } = useSWR(token ? ['/api/users', token] : null, fetcher)
  const loading = !data && !error
  const users = data
  return [users, { mutate, loading, error }]
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
