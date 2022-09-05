import axios from 'axios'
import useSWR from 'swr'
import ToolView from './UI/ToolView'

function OBSTN({ config }) {
  const {
    reference: { chapter, step, verses },
    resource: { owner, repo, commit, bookPath, language },
  } = config
  const params = { owner, repo, commit, bookPath, language, chapter, step, verses }
  const fetcher = (url, params) => axios.get(url, { params }).then((res) => res.data)
  const { data, error } = useSWR([`/api/git/obs-tn`, params], fetcher)
  const loading = !data && !error
  return <>{loading ? 'loading...' : <ToolView data={data} />}</>
}

export default OBSTN
