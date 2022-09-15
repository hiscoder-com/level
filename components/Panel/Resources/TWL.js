import { useGetResource } from 'utils/hooks'
import { Placeholder, TNTWLView } from '../UI'

function TWL({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/twl' })

  return <>{loading ? <Placeholder /> : <TNTWLView data={data} />}</>
}

export default TWL
