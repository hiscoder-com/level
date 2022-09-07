import ToolView from '../UI/ToolView'
import { useGetResource } from 'utils/hooks'

function OBSTN({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/obs-tn' })

  return <>{loading ? 'loading...' : <ToolView data={data} />}</>
}

export default OBSTN
