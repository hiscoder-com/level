import { useGetResource } from 'utils/hooks'
import ToolView from '../UI/ToolView'

function TN({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/tn' })

  return <>{loading ? 'loading...' : <ToolView data={data} />}</>
}

export default TN
