import { useGetResource } from 'utils/hooks'
import Placeholder from '../UI/Placeholder'
import ToolView from '../UI/ToolView'

function OBSTWL({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/obs-twl' })

  return <>{loading ? <Placeholder /> : <ToolView data={data} />}</>
}

export default OBSTWL
