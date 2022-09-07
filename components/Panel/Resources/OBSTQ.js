import { useGetResource } from 'utils/hooks'

import TQView from '../UI/TQView'

function OBSTQ({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/obs-tq' })

  return <>{loading ? 'Loading...' : <TQView data={data} />}</>
}

export default OBSTQ
