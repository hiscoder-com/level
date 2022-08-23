import { useEffect } from 'react'

import 'swagger-ui/dist/swagger-ui.css'
import { useCurrentUser } from 'lib/UserContext'
import axios from 'axios'

function ApiDoc() {
  const { user } = useCurrentUser()
  console.log(user && user.access_token)
  useEffect(() => {
    async function init() {
      const spec = await axios.get('/api/doc')
      const { default: SwaggerUI } = await import('swagger-ui')
      SwaggerUI({ dom_id: '#swagger', spec: spec.data, defaultModelsExpandDepth: -1 })
    }
    init()
  }, [])

  return <div id="swagger">loading...</div>
}

export default ApiDoc
