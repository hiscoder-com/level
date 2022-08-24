import { useEffect, useState } from 'react'

import axios from 'axios'

import 'swagger-ui/dist/swagger-ui.css'

import { useCurrentUser } from 'lib/UserContext'

function ApiDoc() {
  const { user } = useCurrentUser()
  const [copySuccess, setCopySuccess] = useState(null)
  const copyToClipBoard = async (copyMe) => {
    try {
      await navigator.clipboard.writeText(copyMe)
      setCopySuccess('Copied!')
    } catch (err) {
      setCopySuccess('Failed to copy!')
    }
  }
  useEffect(() => {
    async function init() {
      const spec = await axios.get('/api/doc')
      const { default: SwaggerUI } = await import('swagger-ui')
      SwaggerUI({ dom_id: '#swagger', spec: spec.data, defaultModelsExpandDepth: -1 })
    }
    init()
  }, [])

  return (
    <>
      <div id="swagger">loading...</div>
      <button
        className="btn-cyan"
        disabled={copySuccess}
        onClick={() => copyToClipBoard(user?.access_token)}
      >
        {copySuccess ?? 'Copy to clipboard api-key'}
      </button>
    </>
  )
}

export default ApiDoc
