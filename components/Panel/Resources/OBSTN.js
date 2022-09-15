import { useGetResource } from 'utils/hooks'
import { Placeholder, TNTWLView } from '../UI'

function OBSTN({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/obs-tn' })

  return <>{loading ? <Placeholder /> : <TNTWLView data={data} />}</>
}

export default OBSTN
