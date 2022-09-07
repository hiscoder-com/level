import useSWR from 'swr'

import axios from 'axios'

import ReactMarkdown from 'react-markdown'

function Bible({ config }) {
  const {
    reference: { book, chapter, step, verses },
    resource: { owner, repo, commit, bookPath, language },
  } = config
  const params = { owner, repo, commit, bookPath, language, book, chapter, step, verses }
  const fetcher = (url, params) => axios.get(url, { params }).then((res) => res.data)
  const { data, error } = useSWR([`/api/git/bible`, params], fetcher)
  const loading = !data && !error

  return <div>{loading ? 'loading' : <BibleView data={data} checkView={false} />}</div>
}

export default Bible

function BibleView({ data }) {
  return (
    <>
      {data?.map((el) => (
        <ul key={el.verse} className="flex">
          <li className={`py-2`}>
            <ReactMarkdown>{el.verse + ' ' + el.text}</ReactMarkdown>
          </li>
        </ul>
      ))}
    </>
  )
}
