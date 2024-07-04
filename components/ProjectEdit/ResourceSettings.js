import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { toast } from 'react-hot-toast'

import axios from 'axios'

import CommitsList from 'components/CommitsList'
import ButtonLoading from 'components/ButtonLoading'

import { useProject, useMethod, useGetProjectResources } from 'utils/hooks'

function ResourceSettings() {
  const [methods] = useMethod()
  const { t } = useTranslation()

  const [isSaving, setIsSaving] = useState(false)
  const [resourcesUrl, setResourcesUrl] = useState()
  const [currentMethod, setCurrentMethod] = useState()
  const [isErrorCommit, setIsErrorCommit] = useState(false)

  const {
    query: { code },
  } = useRouter()
  const [project] = useProject({ code })

  const [resources] = useGetProjectResources({
    code,
  })

  useEffect(() => {
    if (project?.method && methods) {
      const method = methods.find((method) => method.title === project.method)
      setCurrentMethod(method)
    }
  }, [project?.method, methods])

  useEffect(() => {
    if (resources) {
      const _resources = {}

      for (const [key, value] of Object.entries(resources)) {
        _resources[key] = `${
          process.env.NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org'
        }/${value.owner}/${value.repo}/commit/${value.commit}`
      }
      setResourcesUrl(_resources)
    }
  }, [resources])
  const handleSaveCommits = async () => {
    setIsErrorCommit(false)
    setIsSaving(true)

    axios
      .post(`/api/projects/${code}/update_commits`, {
        resources: resourcesUrl,
        current_method: currentMethod,
        project_id: project.id,
      })
      .then(() => toast.success(t('ResourcesUpdated')))
      .catch((error) => {
        setIsErrorCommit(true)
        console.log(error)
      })
      .finally(() => setIsSaving(false))
  }
  return (
    <>
      <CommitsList
        resourcesUrl={resourcesUrl}
        setResourcesUrl={setResourcesUrl}
        methodId={currentMethod?.id}
      />
      {isErrorCommit && <div className="mt-3">{t('WrongResource')}</div>}
      <ButtonLoading onClick={handleSaveCommits} isLoading={isSaving}>
        {t('Save')}
      </ButtonLoading>
    </>
  )
}

export default ResourceSettings
