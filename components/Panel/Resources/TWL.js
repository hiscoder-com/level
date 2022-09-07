import { useGetResource } from 'utils/hooks'
import ToolView from '../UI/ToolView'

function TWL({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/twl' })

  return <>{loading ? 'loading...' : <ToolView data={data} />}</>
}

export default TWL
