import { useGetResource } from 'utils/hooks'
import ToolView from '../UI/ToolView'

function OBSTWL({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/obs-twl' })

  return <>{loading ? 'loading...' : <ToolView data={data} />}</>
}

export default OBSTWL
