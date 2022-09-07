import { useGetResource } from 'utils/hooks'
import Placeholder from '../UI/Placeholder'

import TQView from '../UI/TQView'

function OBSTQ({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/obs-tq' })

  return <>{loading ? <Placeholder /> : <TQView data={data} />}</>
}

export default OBSTQ
