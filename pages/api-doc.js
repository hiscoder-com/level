import dynamic from 'next/dynamic'

import { useEffect, useState } from 'react'

import axios from 'axios'

import { useCurrentUser } from 'lib/UserContext'

const SwaggerUI = dynamic(import('swagger-ui-react'), { ssr: false })

import 'swagger-ui-react/swagger-ui.css'

function ApiDoc() {
  const [spec, setSpec] = useState()
  const { session } = useCurrentUser()
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
      setSpec(spec.data)
    }
    init()
  }, [])
  return (
    <>
      <SwaggerUI spec={spec} />
      <div className="flex justify-center">
        <button
          className="btn-primary mb-10"
          disabled={labelButton}
          onClick={() => copyToClipBoard(session?.access_token)}
        >
          {labelButton ?? 'Copy to clipboard api-key'}
        </button>
      </div>
    </>
  )
}

export default ApiDoc
