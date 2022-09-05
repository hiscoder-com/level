import axios from 'axios'

import useSWR from 'swr'

import TQView from './UI/TQView'

function OBSTQ({ config }) {
  const {
    reference: { book, chapter, step, verses },
    resource: { owner, repo, commit, bookPath, language },
  } = config
  const params = { owner, repo, commit, bookPath, language, book, chapter, step, verses }
  const fetcher = (url, params) => axios.get(url, { params }).then((res) => res.data)
  const { data, error } = useSWR([`/api/git/obs-tq`, params], fetcher)
  const loading = !data && !error
  return <>{loading ? 'Loading...' : <TQView data={data} />}</>
}

export default OBSTQ
