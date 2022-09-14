import { useGetResource } from 'utils/hooks'
import { Placeholder, TNTWLView } from '../UI'

function OBSTWL({ config }) {
  const { loading, data, error } = useGetResource({ config, url: '/api/git/obs-twl' })

  return <>{loading ? <Placeholder /> : <TNTWLView data={data} />}</>
}

export default OBSTWL
