import { useGetResource } from 'utils/hooks'
import { Placeholder, TNTWLView } from '../UI'

function TN({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/tn' })

  return <>{loading ? <Placeholder /> : <TNTWLView data={data} />}</>
}

export default TN
