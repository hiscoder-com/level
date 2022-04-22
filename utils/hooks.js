import useSWR from 'swr'

export const fetcher = (url) => fetch(url).then((r) => r.json())

export function useUser() {
  const { data, mutate, error } = useSWR('/api/user', fetcher)
  const loading = !data && !error
  const user = data?.user
  return [user, { mutate, loading, error }]
}

export function useLanguages() {
  const { data, mutate, error } = useSWR('/api/languages', fetcher)
  const loading = !data && !error
  const languages = data?.languages
  return [languages, { mutate, loading, error }]
}
