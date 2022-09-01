import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import useSWR from 'swr'

function OBSTN({ config }) {
  const {
    reference: { chapter, step, verses },
    resource: { owner, repo, commit, bookPath, language },
  } = config
  const params = { owner, repo, commit, bookPath, language, chapter, step, verses }
  const fetcher = (url, params) => axios.get(url, { params }).then((res) => res.data)
  const { data, error } = useSWR([`/api/git/obs-tn`, params], fetcher)
  const loading = !data && !error
  return (
    <ul>
      {loading
        ? 'loading...'
        : data?.map((el) => (
            <li key={el.ID} className="py-2">
              <ReactMarkdown>{el.Reference + ' ' + el.Note}</ReactMarkdown>
            </li>
          ))}
    </ul>
  )
}

export default OBSTN
