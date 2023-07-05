import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { Tab } from '@headlessui/react'

import Brief from './Brief/BriefBlock'
import ResourceSettings from './ResourceSettings'
import Participants from './Participants/Participants'
import Breadcrumbs from '../Breadcrumbs'

import { useAccess, useGetSteps, useProject, useUsers } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'
import Steps from 'components/ProjectCreate/Steps'
import { supabase } from 'utils/supabaseClient'
import axios from 'axios'
import { toast } from 'react-hot-toast'

function ProjectEdit() {
  const {
    replace,
    query,
    query: { code, setting },
  } = useRouter()
  const { t } = useTranslation()
  const [customSteps, setCustomSteps] = useState([])

  const { user } = useCurrentUser()

  const [users] = useUsers(user?.access_token)
  const [steps] = useGetSteps({ token: user?.access_token, code })
  const [project] = useProject({ token: user?.access_token, code })
  const [{ isCoordinatorAccess, isModeratorAccess, isAdminAccess }] = useAccess({
    token: user?.access_token,
    user_id: user?.id,
    code: project?.code,
  })
  const tabs = useMemo(
    () =>
      [
        { id: 'general', access: isAdminAccess, label: 'project-edit:General' },
        { id: 'brief', access: true, label: 'project-edit:Brief' },
        { id: 'participants', access: isModeratorAccess, label: 'Participants' },
        {
          id: 'resources',
          access: isAdminAccess,
          label: 'Resources',
        },
        {
          id: 'steps',
          access: isAdminAccess,
          label: 'Steps',
        },
        {
          id: 'briefLocale',
          access: isAdminAccess,
          label: 'BriefLocalization',
        },
      ].filter((el) => el.access),
    [isAdminAccess, isModeratorAccess]
  )
  const idTabs = tabs.map((tab) => tab.id)
  const updateDB = async ({ steps }) => {
    const _steps = steps.map((el) => {
      const { id, description, intro, title } = el
      return { id, description, intro, title }
    })
    // console.log(_steps)
    // return
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .put(`/api/projects/${code}/steps`, {
        _steps,
        project_id: project.id,
      })
      .then()
      .catch((error) => {
        toast.error(t('SaveFailed') + '. ' + t('PleaseCheckInternetConnection'), {
          duration: 8000,
        })
        console.log(error)
      })
  }

  const updateStep = ({ ref, index }) => {
    const _steps = customSteps.map((obj, idx) => {
      if (index === idx) {
        return { ...obj, ...ref }
      }

      return obj
    })
    // localStorage.setItem('methods', JSON.stringify(_methods))
    setCustomSteps(_steps)
  }

  useEffect(() => {
    if (steps) {
      // console.log(steps)
      setCustomSteps(steps)
    }
    // const getSteps = async () => {
    //   const { data, error } = await supabase
    //     .from('steps')
    //     .select('*')
    //     .eq('project_id', project.id)
    //   setCustomSteps(data)
    // }
    // if (project) {
    //   getSteps()
    // }
  }, [steps])
  console.log({ customSteps })
  console.log(steps)
  return (
    <div className="flex flex-col gap-7 mx-auto pb-10 max-w-7xl">
      <Breadcrumbs
        links={[
          { title: project?.title, href: '/projects/' + code },
          { title: t('Settings') },
        ]}
        full
      />

      <div className="hidden sm:flex flex-col gap-7">
        {user?.id && (
          <Tab.Group defaultIndex={idTabs.indexOf(setting)}>
            <Tab.List className="grid grid-cols-3 md:grid-cols-6 xl:grid-cols-9 gap-4 mt-2 lg:text-lg font-bold text-center border-b border-slate-600">
              {tabs.map((tab) => (
                <Tab
                  key={tab.label}
                  className={({ selected }) =>
                    selected ? 'tab-active truncate' : 'tab truncate'
                  }
                  onClick={() =>
                    replace(
                      {
                        query: { ...query, setting: tab.id },
                      },
                      undefined,
                      { shallow: true }
                    )
                  }
                >
                  {t(tab.label)}
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>
                <div className="card flex flex-col gap-2 border-y border-slate-900 py-7">
                  <p className="text-xl font-bold mb-5">Основная информация</p>
                  <GeneralInformation project={project} />
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <Brief access={isCoordinatorAccess} />
              </Tab.Panel>
              <Tab.Panel>
                <Participants
                  user={user}
                  users={users}
                  access={{ isCoordinatorAccess, isAdminAccess }}
                />
              </Tab.Panel>
              <Tab.Panel>
                <ResourceSettings />
              </Tab.Panel>
              <Tab.Panel>
                <div className="card flex flex-col gap-2 border-y border-slate-900 py-7">
                  <p className="text-xl font-bold mb-5">Шаги</p>
                  <Steps customSteps={customSteps} updateStep={updateStep} t={t} />
                  <button
                    className="w-fit btn-secondary btn-filled"
                    onClick={() => updateDB({ steps: customSteps })}
                  >
                    Save
                  </button>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        )}
      </div>
      <div className="flex sm:hidden flex-col gap-7">
        <Brief access={isCoordinatorAccess} />
        <Participants
          user={user}
          users={users}
          access={{ isCoordinatorAccess, isAdminAccess }}
        />
        <ResourceSettings />
      </div>
    </div>
  )
}

export default ProjectEdit

function GeneralInformation({ project }) {
  console.log(project)
  // const inputs = [
  //   { title: 'Название проекта', value: nameProject },
  //   { title: 'Название на целевом языке', value: targetNameProject },
  //   { title: 'Код проекта', value: codeProject },
  //   { title: 'Язык проекта', value: languageProject },
  // ]
  return (
    <>
      {project &&
        Object.keys(project)
          .filter((key) => ['title', 'orig_title', 'code', 'languages'].includes(key))
          .map((key) => (
            <div className="flex gap-2 items-center" key={key}>
              <div className="w-1/4 font-bold">{key}</div>
              <div className="flex flex-col gap-2 w-3/4">
                <input className="input-primary" value={project[key]} />
              </div>
            </div>
          ))}
    </>
  )
}
