import { useGetResource } from 'utils/hooks'
import Placeholder from '../UI/Placeholder'

import TQView from '../UI/ToolView'

function TQ({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/tq' })

  return <>{loading ? <Placeholder /> : <TQView data={data} />}</>
}

export default TQ
