import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import useSWR from 'swr'

function OBS({ config, switchOBSImages = true }) {
  const {
    reference: { book, chapter, step, verses },
    resource: { owner, repo, commit, bookPath, language },
  } = config
  const params = { owner, repo, commit, bookPath, language, chapter, step, verses }
  const fetcher = (url, params) => axios.get(url, { params }).then((res) => res.data)
  const { data, error } = useSWR([`/api/git/obs`, params], fetcher)
  const loading = !data && !error
  return (
    <>
      <div className="text-3xl">{data?.header}</div>
      <ul>
        {loading
          ? 'loading...'
          : data.data?.map((el) => (
              <li key={el.key} className="py-2">
                {el.key}
                <img
                  className={`${!switchOBSImages && 'hidden'}`}
                  src={el.urlImage}
                  alt={`OBS verse #${el.key}`}
                />
                <ReactMarkdown>{el.text}</ReactMarkdown>
              </li>
            ))}
      </ul>
    </>
  )
}

export default OBS
