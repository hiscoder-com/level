import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import useSWR from 'swr'

function OBS({ config }) {
  const {
    reference: { book, chapter, step, verses },
    resource: { owner, repo, commit, bookPath, language },
  } = config
  const params = { owner, repo, commit, bookPath, language, book, chapter, step, verses }
  const fetcher = (url, params) => axios.get(url, { params }).then((res) => res.data)
  const { data, error } = useSWR([`/api/git/obs`, params], fetcher)
  const loading = !data && !error
  return (
    <ul>
      {loading
        ? 'loading...'
        : data?.map((el) => (
            <li key={el.ID} className="py-2">
              <ReactMarkdown>{el.Verse + ' ' + el.OccurrenceNote}</ReactMarkdown>
            </li>
          ))}
    </ul>
  )
}

export default OBS
