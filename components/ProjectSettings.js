import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { Switch } from '@headlessui/react'
import axios from 'axios'

import CommitsList from './CommitsList'

import { useCurrentUser } from 'lib/UserContext'

import { useProject, useMethod, useGetBrief, useGetProjectResources } from 'utils/hooks'

function ProjectSettings() {
  const { user } = useCurrentUser()
  const [methods] = useMethod(user?.access_token)
  const { t } = useTranslation(['common', 'project-edit'])

  const [isSaving, setIsSaving] = useState(false)
  const [resourcesUrl, setResourcesUrl] = useState()
  const [currentMethod, setCurrentMethod] = useState()
  const [isErrorCommit, setIsErrorCommit] = useState(false)

  const {
    query: { code },
  } = useRouter()
  const [project] = useProject({ token: user?.access_token, code })
  const [brief, { mutate }] = useGetBrief({
    token: user?.access_token,
    project_id: project?.id,
  })

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
        _resources[
          key
        ] = `https://git.door43.org/${value.owner}/${value.repo}/src/commit/${value.commit}`
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
      .then()
      .catch((error) => {
        setIsErrorCommit(true)
        console.log(error)
      })
      .finally(() => setIsSaving(false))
  }

  const handleSwitch = () => {
    if (brief) {
      axios.defaults.headers.common['token'] = user?.access_token
      axios
        .put(`/api/briefs/switch/${project?.id}`, { is_enable: !brief?.is_enable })
        .then((res) => mutate())
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="h3 mb-3">
        <Link href={'/projects/' + code + '/edit'}>
          <a className="underline text-blue-700">« {project?.title}/edit</a>
        </Link>
      </div>
      <h1 className="h1 mb-3">{t('ProjectSettings')}</h1>
      <h1 className="h2 mb-3">{t('ListResources')}</h1>
      <CommitsList
        resourcesUrl={resourcesUrl}
        setResourcesUrl={setResourcesUrl}
        methodId={currentMethod?.id}
      />
      {isErrorCommit && <div className="mt-3">{t('WrongResource')}</div>}

      <button className="btn-cyan my-2" onClick={handleSaveCommits} disabled={isSaving}>
        {isSaving ? (
          <svg
            className="animate-spin my-0 mx-auto h-5 w-5 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          t('Save')
        )}
      </button>
      <div>
        <h1 className="h2 mb-3">{t('project-edit:BriefSwitch')}</h1>
        <div className="flex">
          <span className="mr-3">
            {t(`project-edit:${brief?.is_enable ? 'DisableBrief' : 'EnableBrief'}`)}
          </span>
          <Switch
            checked={brief?.is_enable}
            onChange={handleSwitch}
            className={`${
              brief?.is_enable ? 'bg-blue-600' : 'bg-gray-300'
            } relative inline-flex h-6 w-11 items-center rounded-full`}
          >
            <span
              className={`${
                brief?.is_enable ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
        </div>
      </div>
    </div>
  )
}

export default ProjectSettings
