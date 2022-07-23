import React, { useEffect } from 'react'
// import spec from '../public/swagger.json'

import 'swagger-ui/dist/swagger-ui.css'
import { useCurrentUser } from 'lib/UserContext'
import axios from 'axios'

function Doc() {
  const { user, loading } = useCurrentUser()
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

export default Doc
