import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import useSWR from 'swr'

function Bible({ config }) {
  const {
    reference: { book, chapter, step, verses },
    resource: { owner, repo, commit, bookPath, language },
  } = config
  const params = { owner, repo, commit, bookPath, language, book, chapter, step, verses }
  const fetcher = (url, params) => axios.get(url, { params }).then((res) => res.data)
  const { data, error } = useSWR([`/api/bible`, params], fetcher)
  const loading = !data && !error

  return (
    <ul>
      {loading
        ? 'loading'
        : data?.map((el) => (
            <li key={el.verse} className="py-2">
              <ReactMarkdown>{el.verse + ' ' + el.text}</ReactMarkdown>
            </li>
          ))}
    </ul>
  )
}

export default Bible
