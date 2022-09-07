import ToolView from '../UI/ToolView'
import { useGetResource } from 'utils/hooks'
import Placeholder from '../UI/Placeholder'

function OBSTN({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/obs-tn' })

  return <>{loading ? <Placeholder /> : <ToolView data={data} />}</>
}

export default OBSTN
