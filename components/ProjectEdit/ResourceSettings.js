import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { toast } from 'react-hot-toast'

import axios from 'axios'

import CommitsList from '../CommitsList'

import { useCurrentUser } from 'lib/UserContext'

import { useProject, useMethod, useGetProjectResources } from 'utils/hooks'

import Spinner from 'public/spinner.svg'

function ResourceSettings() {
  const { user } = useCurrentUser()
  const [methods] = useMethod(user?.access_token)
  const { t } = useTranslation()

  const [isSaving, setIsSaving] = useState(false)
  const [resourcesUrl, setResourcesUrl] = useState()
  const [currentMethod, setCurrentMethod] = useState()
  const [isErrorCommit, setIsErrorCommit] = useState(false)

  const {
    query: { code },
  } = useRouter()
  const [project] = useProject({ token: user?.access_token, code })

  const [resources] = useGetProjectResources({
    token: user?.access_token,
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
        }/${value.owner}/${value.repo}/src/commit/${value.commit}`
      }
      setResourcesUrl(_resources)
    }
  }, [resources])
  const handleSaveCommits = async () => {
    setIsErrorCommit(false)
    setIsSaving(true)

    axios.defaults.headers.common['token'] = user?.access_token
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
    <div className="card flex flex-col gap-7">
      <h3 className="text-xl font-bold">{t('ListResources')}</h3>
      <CommitsList
        resourcesUrl={resourcesUrl}
        setResourcesUrl={setResourcesUrl}
        methodId={currentMethod?.id}
      />
      {isErrorCommit && <div className="mt-3">{t('WrongResource')}</div>}

      <button
        className="btn-primary w-fit text-xl"
        onClick={handleSaveCommits}
        disabled={isSaving}
      >
        {isSaving ? (
          <Spinner className="h-5 w-5 text-gray-400 animate-spin" />
        ) : (
          t('Save')
        )}
      </button>
    </div>
  )
}

export default ResourceSettings
