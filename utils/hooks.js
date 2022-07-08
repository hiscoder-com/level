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
