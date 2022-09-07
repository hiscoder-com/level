import { useGetResource } from 'utils/hooks'
import Placeholder from '../UI/Placeholder'
import ToolView from '../UI/ToolView'

function TWL({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/twl' })

  return <>{loading ? <Placeholder /> : <ToolView data={data} />}</>
}

export default TWL
