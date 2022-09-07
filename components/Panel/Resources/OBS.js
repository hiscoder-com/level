import ReactMarkdown from 'react-markdown'
import { useGetResource } from 'utils/hooks'

function OBS({ config }) {
  const { loading, data, error } = useGetResource({ config, url: `/api/git/obs` })
  return (
    <>
      <div className="text-3xl">{data?.header}</div>
      {loading ? (
        'loading...'
      ) : (
        <div>
          {data?.verseObjects?.map((el) => (
            <div key={el.key} className="py-2 flex">
              <span className="mr-2">{el.key}</span>

              <ReactMarkdown>{el.text}</ReactMarkdown>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default OBS
