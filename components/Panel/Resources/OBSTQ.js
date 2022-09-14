import { useGetResource } from 'utils/hooks'
import { Placeholder, TQView } from '../UI'

function OBSTQ({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/obs-tq' })

  return <>{loading ? <Placeholder /> : <TQView data={data} />}</>
}

export default OBSTQ
