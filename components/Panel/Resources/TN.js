import { useGetResource } from 'utils/hooks'
import Placeholder from '../UI/Placeholder'
import ToolView from '../UI/ToolView'

function TN({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/tn' })

  return <>{loading ? <Placeholder /> : <ToolView data={data} />}</>
}

export default TN
