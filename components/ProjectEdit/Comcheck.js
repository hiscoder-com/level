import TranslationCheck from 'components/Project/TranslationCheck'
import React from 'react'
import { useRouter } from 'next/router'
import { useProject } from 'utils/hooks'
import { useTranslation } from 'react-i18next'

function Comcheck() {
  const { query } = useRouter()

  const { t } = useTranslation()
  const [project, { mutate }] = useProject({ code: query.code })
  return (
    <div>
      <TranslationCheck project={project} mutate={mutate} />
    </div>
  )
}

export default Comcheck
