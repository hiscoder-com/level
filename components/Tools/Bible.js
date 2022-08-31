import useSWR from 'swr'
import loadable from '@loadable/component'

function Bible({ config }) {
  const {
    reference: { book, chapter, step },
    resource: { owner, repo, commit, bookPath, language },
  } = config
  const fetcher = (url, config) =>
    fetch(url, {
      method: 'GET',
      headers: new Headers({ 'Content-Type': 'application/json', config }),
      credentials: 'same-origin',
    }).then((res) => res.json())
  const { data, error } = useSWR(
    config
      ? [
          `/api/bible/${repo}?book=${book}&chapter=${chapter}&owner=${owner}&bookPath=${bookPath}&commit=${commit}&language=${language}`,
          config,
        ]
      : null,
    fetcher
  )
  const loading = !data && !error
  // +

  return (
    <div>
      {data?.map((el) => (
        <li key={el.key}>
          {el.key} {el.text}
        </li>
      ))}
    </div>
  )
}

export default Bible
