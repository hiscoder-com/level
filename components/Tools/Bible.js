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

  return <ul>{loading ? 'loading' : <BibleView data={data} checkView={false} />}</ul>
}

export default Bible

function BibleView({ data, blurVerses = ['1'], checkView, checked, setChecked }) {
  return (
    <>
      {data?.map((el) => (
        <div key={el.verse} className="flex">
          {checkView && (
            <input
              type="checkbox"
              checked={checked}
              onChange={() => setChecked((prev) => !prev)}
            />
          )}
          &nbsp;
          <li className={`${blurVerses?.includes(el.verse) && 'blur-sm'} py-2`}>
            <ReactMarkdown>{el.verse + ' ' + el.text}</ReactMarkdown>
          </li>
        </div>
      ))}
    </>
  )
}
