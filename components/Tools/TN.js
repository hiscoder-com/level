import useSWR from 'swr'
import loadable from '@loadable/component'
const ReactJson = loadable(() => import('react-json-view'))
function TN({ config }) {
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
          `/api/tn/${repo}?book=${book}&chapter=${chapter}&owner=${owner}&bookPath=${bookPath}&commit=${commit}&language=${language}`,
          config,
        ]
      : null,
    fetcher
  )
  const loading = !data && !error
  // +
  console.log(data)
  return (
    <div>
      {data?.map((el, index) => (
        <li key={el.index}>
          {el.Verse} {el.OccurrenceNote}
        </li>
      ))}
    </div>
  )
}

export default TN
