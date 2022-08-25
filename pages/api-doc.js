import { useEffect, useState } from 'react'

import axios from 'axios'

import { useCurrentUser } from 'lib/UserContext'

import 'swagger-ui/dist/swagger-ui.css'

function ApiDoc() {
  const { user } = useCurrentUser()
  const [labelButton, setLabelButton] = useState(null)
  const copyToClipBoard = async (token) => {
    try {
      await navigator.clipboard.writeText(token)
      setLabelButton('Copied!')
    } catch (err) {
      setLabelButton('Failed to copy!')
    }
    setTimeout(() => {
      setLabelButton(null)
    }, 10000)
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
      <div className="flex justify-center">
        <button
          className="btn-cyan"
          disabled={labelButton}
          onClick={() => copyToClipBoard(user?.access_token)}
        >
          {labelButton ?? 'Copy to clipboard api-key'}
        </button>
      </div>
    </>
  )
}

export default ApiDoc
